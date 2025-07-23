const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database-sqlite');
const { validateRequest } = require('../middleware/auth');

const router = express.Router();

// Validações para login
const loginValidations = [
  { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50 },
  { field: 'password', required: true, type: 'string', minLength: 6 }
];

// Rota de login
router.post('/login', validateRequest(loginValidations), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário na base de dados
    const users = await executeQuery(
      'SELECT id, username, password_hash, role FROM admin_users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
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

// Rota para verificar token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se usuário ainda existe
    const users = await executeQuery(
      'SELECT id, username, role FROM admin_users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      valid: true,
      user: {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role
      }
    });

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota para logout (opcional - principalmente para limpar token no frontend)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;

