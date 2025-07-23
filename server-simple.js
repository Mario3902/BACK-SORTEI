const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery, testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await executeQuery(
      'SELECT id, username, role FROM admin_users WHERE id = ?',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor do Programa de Bolsas de Estudo funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar base de dados
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      database: isConnected ? 'MySQL Conectado' : 'Erro de conexão',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao testar conexão',
      message: error.message
    });
  }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const users = await executeQuery(
      'SELECT id, username, password_hash, role FROM admin_users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar candidatura
app.post('/api/applications', async (req, res) => {
  try {
    const {
      nome_completo,
      email,
      telefone,
      data_nascimento,
      genero,
      endereco,
      cidade,
      provincia,
      curso,
      universidade,
      ano_academico,
      media_atual,
      situacao_financeira,
      renda_familiar,
      motivacao,
      objetivos,
      experiencia_academica,
      atividades_extracurriculares,
      referencias
    } = req.body;

    // Validações básicas
    if (!nome_completo || !email || !telefone || !curso || !universidade) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta' });
    }

    // Verificar se email já existe
    const existingApplication = await executeQuery(
      'SELECT id FROM applications WHERE email = ?',
      [email]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({ error: 'Já existe uma candidatura com este email' });
    }

    // Inserir nova candidatura
    const result = await executeQuery(
      `INSERT INTO applications (
        nome_completo, email, telefone, data_nascimento, genero, endereco, cidade, provincia,
        curso, universidade, ano_academico, media_atual, situacao_financeira, renda_familiar,
        motivacao, objetivos, experiencia_academica, atividades_extracurriculares, referencias
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_completo, email, telefone, data_nascimento, genero, endereco, cidade, provincia,
        curso, universidade, ano_academico, media_atual, situacao_financeira, renda_familiar,
        motivacao, objetivos, experiencia_academica, atividades_extracurriculares, referencias
      ]
    );

    res.status(201).json({
      message: 'Candidatura submetida com sucesso',
      applicationId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar candidatura:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar candidaturas (admin)
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM applications';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY data_submissao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const applications = await executeQuery(query, params);

    res.json({ applications });

  } catch (error) {
    console.error('Erro ao listar candidaturas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar bolsas públicas
app.get('/api/scholarships/public', async (req, res) => {
  try {
    const scholarships = await executeQuery(
      `SELECT id, nome, descricao, valor, duracao_meses, requisitos, 
              data_inicio, data_fim, vagas_disponiveis 
       FROM scholarships 
       WHERE status = 'ativo' AND data_fim >= CURDATE()
       ORDER BY data_inicio DESC`
    );

    res.json(scholarships);

  } catch (error) {
    console.error('Erro ao listar bolsas públicas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter estatísticas (admin)
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const applicationStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'rejeitado' THEN 1 ELSE 0 END) as rejected_applications
      FROM applications
    `);

    const scholarshipStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_scholarships,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as active_scholarships
      FROM scholarships
    `);

    res.json({
      applicationStats: applicationStats[0],
      scholarshipStats: scholarshipStats[0]
    });

  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor apenas se não estiver no Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
    console.log(`URL: http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;

