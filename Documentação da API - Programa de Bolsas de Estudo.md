# Documentação da API - Programa de Bolsas de Estudo

## Base URL
```
https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## Endpoints

### 1. Saúde do Sistema

#### GET /api/health
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "message": "Servidor do Programa de Bolsas de Estudo funcionando!",
  "timestamp": "2025-07-23T20:36:48.082Z"
}
```

### 2. Teste de Base de Dados

#### GET /api/test-db
Testa a conexão com a base de dados.

**Resposta:**
```json
{
  "database": "MySQL Conectado",
  "timestamp": "2025-07-23T20:36:48.082Z"
}
```

## 🔐 Autenticação

### POST /api/auth/login
Realiza login e retorna token JWT.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Resposta de Erro:**
```json
{
  "error": "Credenciais inválidas"
}
```

## 📝 Candidaturas

### POST /api/applications
Cria uma nova candidatura (endpoint público).

**Request:**
```json
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
  "renda_familiar": 50000.00,
  "motivacao": "Desejo concluir os estudos para contribuir com o desenvolvimento do país...",
  "objetivos": "Tornar-me um engenheiro de software competente...",
  "experiencia_academica": "Participei em vários projetos académicos...",
  "atividades_extracurriculares": "Voluntariado, desporto, música...",
  "referencias": "Professor João - joao@prof.com, Dr. Maria - maria@doc.com"
}
```

**Campos Obrigatórios:**
- `nome_completo`
- `email`
- `telefone`
- `curso`
- `universidade`

**Resposta de Sucesso:**
```json
{
  "message": "Candidatura submetida com sucesso",
  "applicationId": 123
}
```

**Resposta de Erro:**
```json
{
  "error": "Já existe uma candidatura com este email"
}
```

### GET /api/applications
Lista todas as candidaturas (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (opcional): `pendente`, `aprovado`, `rejeitado`
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 10)

**Resposta:**
```json
{
  "applications": [
    {
      "id": 1,
      "nome_completo": "João Silva",
      "email": "joao@email.com",
      "telefone": "923456789",
      "curso": "Engenharia Informática",
      "universidade": "Universidade Agostinho Neto",
      "status": "pendente",
      "data_submissao": "2025-07-23T20:30:00.000Z",
      "data_atualizacao": "2025-07-23T20:30:00.000Z"
    }
  ]
}
```

## 🎓 Bolsas de Estudo

### GET /api/scholarships/public
Lista bolsas ativas (endpoint público).

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Bolsa Manuel Xirimbi 2024",
    "descricao": "Programa de bolsas de estudo para estudantes universitários angolanos",
    "valor": 50000.00,
    "duracao_meses": 12,
    "requisitos": "Estudante universitário, média mínima de 14 valores, situação financeira comprovada",
    "data_inicio": "2024-01-01",
    "data_fim": "2024-12-31",
    "vagas_disponiveis": 50
  }
]
```

## 📊 Dashboard Administrativo

### GET /api/admin/dashboard
Retorna estatísticas do sistema (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "applicationStats": {
    "total_applications": 150,
    "pending_applications": 45,
    "approved_applications": 80,
    "rejected_applications": 25
  },
  "scholarshipStats": {
    "total_scholarships": 5,
    "active_scholarships": 3
  }
}
```

## 📋 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🔒 Validações

### Candidaturas
- **nome_completo**: 2-255 caracteres
- **email**: formato válido de email
- **telefone**: 9-20 caracteres
- **curso**: máximo 255 caracteres
- **universidade**: máximo 255 caracteres

### Login
- **username**: 3-50 caracteres
- **password**: mínimo 6 caracteres

## 🚨 Tratamento de Erros

Todos os erros retornam um objeto JSON com a estrutura:

```json
{
  "error": "Descrição do erro",
  "details": ["Detalhes específicos"] // opcional
}
```

## 📝 Exemplos de Uso

### Exemplo completo: Criar candidatura e fazer login

1. **Criar candidatura:**
```bash
curl -X POST https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "923456789",
    "curso": "Medicina",
    "universidade": "Universidade Agostinho Neto"
  }'
```

2. **Fazer login:**
```bash
curl -X POST https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

3. **Listar candidaturas:**
```bash
curl -X GET https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer/api/applications \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔧 Configuração para Frontend

Para conectar o frontend hospedado no Vercel, use a URL base:
```
https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer
```

O CORS está configurado para aceitar requests de qualquer origem (`*`).

