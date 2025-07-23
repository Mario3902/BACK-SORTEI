const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireAdmin, validateRequest } = require('../middleware/auth');

const router = express.Router();

// Validações para criação/atualização de bolsa
const scholarshipValidations = [
  { field: 'nome', required: true, type: 'string', minLength: 2, maxLength: 255 },
  { field: 'descricao', required: false, type: 'string' },
  { field: 'valor', required: true, type: 'number' },
  { field: 'duracao_meses', required: true, type: 'number' },
  { field: 'vagas_disponiveis', required: true, type: 'number' }
];

// Rota para listar bolsas ativas (pública)
router.get('/public', async (req, res) => {
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

// Rota para obter detalhes de uma bolsa específica (pública)
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const scholarships = await executeQuery(
      `SELECT id, nome, descricao, valor, duracao_meses, requisitos, 
              data_inicio, data_fim, vagas_disponiveis 
       FROM scholarships 
       WHERE id = ? AND status = 'ativo'`,
      [id]
    );

    if (scholarships.length === 0) {
      return res.status(404).json({ error: 'Bolsa não encontrada ou inativa' });
    }

    res.json(scholarships[0]);

  } catch (error) {
    console.error('Erro ao obter bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar todas as bolsas (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM scholarships';
    let countQuery = 'SELECT COUNT(*) as total FROM scholarships';
    const params = [];
    const countParams = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [scholarships, totalResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      scholarships,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar bolsas:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter bolsa específica (apenas admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const scholarships = await executeQuery(
      'SELECT * FROM scholarships WHERE id = ?',
      [id]
    );

    if (scholarships.length === 0) {
      return res.status(404).json({ error: 'Bolsa não encontrada' });
    }

    res.json(scholarships[0]);

  } catch (error) {
    console.error('Erro ao obter bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar nova bolsa (apenas admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(scholarshipValidations), async (req, res) => {
  try {
    const {
      nome,
      descricao,
      valor,
      duracao_meses,
      requisitos,
      data_inicio,
      data_fim,
      vagas_disponiveis,
      status = 'ativo'
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO scholarships (
        nome, descricao, valor, duracao_meses, requisitos, 
        data_inicio, data_fim, vagas_disponiveis, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, valor, duracao_meses, requisitos, data_inicio, data_fim, vagas_disponiveis, status]
    );

    res.status(201).json({
      message: 'Bolsa criada com sucesso',
      scholarshipId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar bolsa (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, validateRequest(scholarshipValidations), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      valor,
      duracao_meses,
      requisitos,
      data_inicio,
      data_fim,
      vagas_disponiveis,
      status
    } = req.body;

    const result = await executeQuery(
      `UPDATE scholarships SET 
        nome = ?, descricao = ?, valor = ?, duracao_meses = ?, requisitos = ?,
        data_inicio = ?, data_fim = ?, vagas_disponiveis = ?, status = ?
       WHERE id = ?`,
      [nome, descricao, valor, duracao_meses, requisitos, data_inicio, data_fim, vagas_disponiveis, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bolsa não encontrada' });
    }

    res.json({ message: 'Bolsa atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar bolsa (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'DELETE FROM scholarships WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bolsa não encontrada' });
    }

    res.json({ message: 'Bolsa deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar status da bolsa (apenas admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ativo', 'inativo'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const result = await executeQuery(
      'UPDATE scholarships SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bolsa não encontrada' });
    }

    res.json({ message: 'Status da bolsa atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar status da bolsa:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

