const express = require('express');
const { executeQuery } = require('../config/database-sqlite');
const { authenticateToken, requireAdmin, validateRequest } = require('../middleware/auth');

const router = express.Router();

// Validações para criação de candidatura
const applicationValidations = [
  { field: 'nome_completo', required: true, type: 'string', minLength: 2, maxLength: 255 },
  { field: 'email', required: true, type: 'string', maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { field: 'telefone', required: true, type: 'string', minLength: 9, maxLength: 20 },
  { field: 'curso', required: true, type: 'string', maxLength: 255 },
  { field: 'universidade', required: true, type: 'string', maxLength: 255 }
];

// Rota para criar nova candidatura (pública)
router.post('/', validateRequest(applicationValidations), async (req, res) => {
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

// Rota para listar todas as candidaturas (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM applications';
    let countQuery = 'SELECT COUNT(*) as total FROM applications';
    const params = [];
    const countParams = [];

    // Filtros
    const conditions = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      conditions.push('(nome_completo LIKE ? OR email LIKE ? OR curso LIKE ? OR universidade LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY data_submissao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Executar queries
    const [applications, totalResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar candidaturas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter candidatura específica (apenas admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const applications = await executeQuery(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Candidatura não encontrada' });
    }

    res.json(applications[0]);

  } catch (error) {
    console.error('Erro ao obter candidatura:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar status da candidatura (apenas admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendente', 'aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const result = await executeQuery(
      'UPDATE applications SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidatura não encontrada' });
    }

    res.json({ message: 'Status atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar status:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar candidatura (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'DELETE FROM applications WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidatura não encontrada' });
    }

    res.json({ message: 'Candidatura deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar candidatura:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter estatísticas das candidaturas (apenas admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
        SUM(CASE WHEN status = 'rejeitado' THEN 1 ELSE 0 END) as rejeitados,
        SUM(CASE WHEN DATE(data_submissao) = CURDATE() THEN 1 ELSE 0 END) as hoje,
        SUM(CASE WHEN WEEK(data_submissao) = WEEK(CURDATE()) THEN 1 ELSE 0 END) as esta_semana
      FROM applications
    `);

    res.json(stats[0]);

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

