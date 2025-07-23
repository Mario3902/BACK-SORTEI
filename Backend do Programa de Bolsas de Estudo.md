# Backend do Programa de Bolsas de Estudo

Este é o backend Node.js com Express para o sistema de gestão de bolsas de estudo.

## 🚀 URL Pública de Teste

**URL Base:** `https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer`

## 📋 Funcionalidades

- ✅ API REST completa para gestão de candidaturas
- ✅ Sistema de autenticação JWT
- ✅ Gestão de bolsas de estudo
- ✅ Dashboard administrativo
- ✅ CORS configurado para frontend
- ✅ Validação de dados
- ✅ Tratamento de erros

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver para MySQL
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Segurança
- **Express Rate Limit** - Limitação de requests

## 📚 Endpoints da API

### 🔍 Saúde do Sistema
```
GET /api/health
```
Retorna o status do servidor.

### 🔐 Autenticação
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 📝 Candidaturas

#### Criar Candidatura (Público)
```
POST /api/applications
Content-Type: application/json

{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "telefone": "923456789",
  "data_nascimento": "1995-05-15",
  "genero": "masculino",
  "endereco": "Rua das Flores, 123",
  "cidade": "Luanda",
  "provincia": "Luanda",
  "curso": "Engenharia Informática",
  "universidade": "Universidade Agostinho Neto",
  "ano_academico": "3º Ano",
  "media_atual": 16.5,
  "situacao_financeira": "Família de baixa renda",
  "renda_familiar": 50000,
  "motivacao": "Desejo concluir os estudos...",
  "objetivos": "Tornar-me um engenheiro...",
  "experiencia_academica": "Participei em vários projetos...",
  "atividades_extracurriculares": "Voluntariado, desporto...",
  "referencias": "Professor João - joao@prof.com"
}
```

#### Listar Candidaturas (Admin)
```
GET /api/applications
Authorization: Bearer <token>
```

### 🎓 Bolsas de Estudo

#### Listar Bolsas Públicas
```
GET /api/scholarships/public
```

### 📊 Dashboard Administrativo
```
GET /api/admin/dashboard
Authorization: Bearer <token>
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Base de Dados
DB_HOST=65.108.244.136
DB_USER=bolsadae_admin
DB_PASSWORD=&2K^Tnf{+=jyI)Cq
DB_NAME=bolsadee_bolsa_estudos
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789

# CORS
CORS_ORIGIN=*
```

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📁 Estrutura do Projeto

```
bolsa-estudos-backend-nodejs/
├── config/
│   ├── database.js          # Configuração MySQL
│   └── database-sqlite.js   # Configuração SQLite (demo)
├── middleware/
│   └── auth.js              # Middleware de autenticação
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── applications.js      # Rotas de candidaturas
│   ├── scholarships.js      # Rotas de bolsas
│   └── admin.js             # Rotas administrativas
├── server.js                # Servidor principal
├── server-simple.js         # Servidor simplificado (atual)
├── .env                     # Variáveis de ambiente
├── package.json             # Dependências
└── README.md               # Documentação
```

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **Rate Limiting** - Proteção contra spam
- **JWT** - Tokens seguros
- **bcrypt** - Hash de senhas
- **Validação** - Dados de entrada

## 🐛 Resolução de Problemas

### Problema de Conexão com MySQL
Se houver problemas de conexão com a base de dados MySQL:

1. Verificar credenciais no arquivo `.env`
2. Confirmar que o IP está autorizado na base de dados
3. Verificar firewall e portas
4. Usar a versão SQLite para testes locais

### Credenciais Padrão
- **Username:** admin
- **Password:** admin123

## 📞 Suporte

Para problemas de conexão com a base de dados, verificar:
- Credenciais corretas
- Permissões de acesso remoto
- Configuração de firewall
- Status do servidor MySQL

## 🔄 Status Atual

✅ **Servidor funcionando:** https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer
⚠️ **Base de dados:** Problema de autenticação com MySQL
🔧 **Solução:** Verificar credenciais e permissões de acesso remoto

