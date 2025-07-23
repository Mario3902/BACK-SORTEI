const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo da base de dados SQLite
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Criar conexão com SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('✅ Conexão com SQLite estabelecida com sucesso!');
  }
});

// Função para inicializar as tabelas
const initializeTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Criar tabela applications
      db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_completo TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          telefone TEXT NOT NULL,
          data_nascimento DATE,
          genero TEXT CHECK(genero IN ('masculino', 'feminino', 'outro')),
          endereco TEXT,
          cidade TEXT,
          provincia TEXT,
          curso TEXT NOT NULL,
          universidade TEXT NOT NULL,
          ano_academico TEXT,
          media_atual REAL,
          situacao_financeira TEXT,
          renda_familiar REAL,
          motivacao TEXT,
          objetivos TEXT,
          experiencia_academica TEXT,
          atividades_extracurriculares TEXT,
          referencias TEXT,
          status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aprovado', 'rejeitado')),
          data_submissao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erro ao criar tabela applications:', err.message);
      });

      // Criar tabela admin_users
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erro ao criar tabela admin_users:', err.message);
      });

      // Criar tabela scholarships
      db.run(`
        CREATE TABLE IF NOT EXISTS scholarships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          descricao TEXT,
          valor REAL,
          duracao_meses INTEGER,
          requisitos TEXT,
          data_inicio DATE,
          data_fim DATE,
          vagas_disponiveis INTEGER DEFAULT 1,
          status TEXT DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erro ao criar tabela scholarships:', err.message);
        else {
          // Inserir dados de exemplo
          insertSampleData();
          resolve();
        }
      });
    });
  });
};

// Função para inserir dados de exemplo
const insertSampleData = () => {
  // Inserir usuário admin padrão (senha: admin123)
  const adminPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  db.run(`
    INSERT OR IGNORE INTO admin_users (username, password_hash, role) 
    VALUES ('admin', ?, 'admin')
  `, [adminPasswordHash]);

  // Inserir bolsa de exemplo
  db.run(`
    INSERT OR IGNORE INTO scholarships (
      nome, descricao, valor, duracao_meses, requisitos, 
      data_inicio, data_fim, vagas_disponiveis
    ) VALUES (
      'Bolsa Manuel Xirimbi 2024',
      'Programa de bolsas de estudo para estudantes universitários angolanos',
      50000.00,
      12,
      'Estudante universitário, média mínima de 14 valores, situação financeira comprovada',
      '2024-01-01',
      '2024-12-31',
      50
    )
  `);
};

// Função para executar queries
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            insertId: this.lastID, 
            affectedRows: this.changes 
          });
        }
      });
    }
  });
};

// Função para testar conexão
const testConnection = async () => {
  try {
    await executeQuery('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão SQLite:', error.message);
    return false;
  }
};

module.exports = {
  db,
  executeQuery,
  testConnection,
  initializeTables
};

