const express = require('express');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireAdmin, validateRequest } = require('../middleware/auth');

const router = express.Router();

// Validações para criação de usuário admin
const adminUserValidations = [
  { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50 },
  { field: 'password', required: true, type: 'string', minLength: 6 },
  { field: 'role', required: false, type: 'string' }
];

// Rota para listar usuários admin (apenas admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, role, created_at FROM admin_users ORDER BY created_at DESC'
    );

    res.json(users);

  } catch (error) {
    console.error('Erro ao listar usuários admin:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar novo usuário admin (apenas admin)
router.post('/users', authenticateToken, requireAdmin, validateRequest(adminUserValidations), async (req, res) => {
  try {
    const { username, password, role = 'admin' } = req.body;

    // Verificar se username já existe
    const existingUser = await executeQuery(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir novo usuário
    const result = await executeQuery(
      'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, role]
    );

    res.status(201).json({
      message: 'Usuário admin criado com sucesso',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar senha de usuário admin (apenas admin)
router.patch('/users/:id/password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await executeQuery(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Senha atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar usuário admin (apenas admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir deletar o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível deletar o próprio usuário' });
    }

    const result = await executeQuery(
      'DELETE FROM admin_users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter dashboard com estatísticas gerais (apenas admin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Estatísticas das candidaturas
    const applicationStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'rejeitado' THEN 1 ELSE 0 END) as rejected_applications,
        SUM(CASE WHEN DATE(data_submissao) = CURDATE() THEN 1 ELSE 0 END) as applications_today,
        SUM(CASE WHEN WEEK(data_submissao) = WEEK(CURDATE()) THEN 1 ELSE 0 END) as applications_this_week
      FROM applications
    `);

    // Estatísticas das bolsas
    const scholarshipStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_scholarships,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as active_scholarships,
        SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as inactive_scholarships,
        SUM(vagas_disponiveis) as total_available_spots
      FROM scholarships
    `);

    // Candidaturas recentes
    const recentApplications = await executeQuery(`
      SELECT id, nome_completo, email, curso, universidade, status, data_submissao
      FROM applications 
      ORDER BY data_submissao DESC 
      LIMIT 5
    `);

    // Candidaturas por curso (top 5)
    const applicationsByCourse = await executeQuery(`
      SELECT curso, COUNT(*) as count
      FROM applications 
      GROUP BY curso 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Candidaturas por universidade (top 5)
    const applicationsByUniversity = await executeQuery(`
      SELECT universidade, COUNT(*) as count
      FROM applications 
      GROUP BY universidade 
      ORDER BY count DESC 
      LIMIT 5
    `);

    res.json({
      applicationStats: applicationStats[0],
      scholarshipStats: scholarshipStats[0],
      recentApplications,
      applicationsByCourse,
      applicationsByUniversity
    });

  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter perfil do usuário logado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, role, created_at FROM admin_users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Erro ao obter perfil:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar perfil do usuário logado
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    // Se está tentando alterar a senha, verificar senha atual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
      }

      // Verificar senha atual
      const users = await executeQuery(
        'SELECT password_hash FROM admin_users WHERE id = ?',
        [req.user.id]
      );

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await executeQuery(
        'UPDATE admin_users SET password_hash = ? WHERE id = ?',
        [passwordHash, req.user.id]
      );
    }

    // Atualizar username se fornecido
    if (username && username !== req.user.username) {
      // Verificar se novo username já existe
      const existingUser = await executeQuery(
        'SELECT id FROM admin_users WHERE username = ? AND id != ?',
        [username, req.user.id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Nome de usuário já existe' });
      }

      await executeQuery(
        'UPDATE admin_users SET username = ? WHERE id = ?',
        [username, req.user.id]
      );
    }

    res.json({ message: 'Perfil atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

