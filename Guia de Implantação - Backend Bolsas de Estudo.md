# Guia de Implantação - Backend Bolsas de Estudo

## 🚀 Implantação Rápida

### 1. Pré-requisitos
- Node.js 18+ instalado
- Acesso à base de dados MySQL
- Credenciais corretas da base de dados

### 2. Instalação
```bash
# Clonar ou copiar o projeto
cd bolsa-estudos-backend-nodejs

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Configuração da Base de Dados

#### Verificar Credenciais
Edite o arquivo `.env`:
```env
DB_HOST=65.108.244.136
DB_USER=bolsadae_admin
DB_PASSWORD=&2K^Tnf{+=jyI)Cq
DB_NAME=bolsadee_bolsa_estudos
DB_PORT=3306
```

#### Testar Conexão
```bash
# Testar conexão MySQL
mysql -h 65.108.244.136 -P 3306 -u bolsadae_admin -p bolsadee_bolsa_estudos

# Ou usar o endpoint de teste
curl http://localhost:3000/api/test-db
```

### 4. Executar o Servidor

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm start
```

## 🔧 Resolução de Problemas

### Problema: "Access denied for user"

**Causa:** Credenciais incorretas ou usuário sem permissões.

**Soluções:**
1. Verificar credenciais no `.env`
2. Confirmar permissões do usuário MySQL
3. Verificar se o IP está autorizado

```sql
-- No MySQL, verificar usuário
SELECT User, Host FROM mysql.user WHERE User = 'bolsadae_admin';

-- Dar permissões se necessário
GRANT ALL PRIVILEGES ON bolsadee_bolsa_estudos.* TO 'bolsadae_admin'@'%';
FLUSH PRIVILEGES;
```

### Problema: "Connection timeout"

**Causa:** Firewall ou rede bloqueando conexão.

**Soluções:**
1. Verificar firewall do servidor MySQL
2. Confirmar que a porta 3306 está aberta
3. Testar conectividade de rede

```bash
# Testar conectividade
telnet 65.108.244.136 3306
```

### Problema: "Database not found"

**Causa:** Base de dados não existe.

**Solução:**
```sql
-- Criar base de dados se não existir
CREATE DATABASE IF NOT EXISTS bolsadee_bolsa_estudos;
USE bolsadee_bolsa_estudos;

-- Executar script de criação das tabelas
-- (Ver schema fornecido no início do projeto)
```

## 🌐 Implantação em Produção

### Opção 1: Servidor VPS/Dedicado

```bash
# 1. Configurar servidor
sudo apt update
sudo apt install nodejs npm mysql-client

# 2. Clonar projeto
git clone <seu-repositorio>
cd bolsa-estudos-backend-nodejs

# 3. Instalar dependências
npm install --production

# 4. Configurar PM2 para produção
npm install -g pm2
pm2 start server-simple.js --name "bolsa-backend"
pm2 startup
pm2 save

# 5. Configurar proxy reverso (Nginx)
sudo apt install nginx
```

#### Configuração Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opção 2: Heroku

```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Criar app
heroku create bolsa-estudos-backend

# 4. Configurar variáveis de ambiente
heroku config:set DB_HOST=65.108.244.136
heroku config:set DB_USER=bolsadae_admin
heroku config:set DB_PASSWORD="&2K^Tnf{+=jyI)Cq"
heroku config:set DB_NAME=bolsadee_bolsa_estudos
heroku config:set JWT_SECRET=sua_chave_secreta_aqui

# 5. Deploy
git push heroku main
```

### Opção 3: DigitalOcean App Platform

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente
```env
NODE_ENV=production
JWT_SECRET=chave_muito_segura_e_complexa_aqui
DB_PASSWORD=senha_forte_da_base_de_dados
```

### 2. HTTPS
- Usar certificado SSL/TLS
- Configurar HTTPS no proxy reverso
- Redirecionar HTTP para HTTPS

### 3. Rate Limiting
O sistema já inclui rate limiting configurado para:
- 100 requests por 15 minutos por IP
- Aplicado a todas as rotas `/api`

### 4. Headers de Segurança
O Helmet já está configurado para adicionar headers de segurança.

## 📊 Monitorização

### Logs
```bash
# Ver logs em tempo real
pm2 logs bolsa-backend

# Ver logs específicos
pm2 logs bolsa-backend --lines 100
```

### Métricas
```bash
# Status dos processos
pm2 status

# Monitorização
pm2 monit
```

## 🔄 Atualizações

### Processo de Atualização
```bash
# 1. Backup da base de dados
mysqldump -h 65.108.244.136 -u bolsadae_admin -p bolsadee_bolsa_estudos > backup.sql

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
npm install

# 4. Reiniciar serviço
pm2 restart bolsa-backend

# 5. Verificar funcionamento
curl http://localhost:3000/api/health
```

## 📞 Suporte

### Verificações Básicas
1. ✅ Servidor está rodando?
2. ✅ Base de dados está acessível?
3. ✅ Credenciais estão corretas?
4. ✅ Firewall permite conexões?
5. ✅ DNS está configurado?

### Comandos Úteis
```bash
# Verificar status do servidor
curl http://localhost:3000/api/health

# Testar base de dados
curl http://localhost:3000/api/test-db

# Ver logs
pm2 logs bolsa-backend

# Reiniciar servidor
pm2 restart bolsa-backend
```

## 🎯 URL Atual de Teste

**Backend funcionando em:**
```
https://3000-i0543em20nq1ufa3p5v0m-739c1e57.manusvm.computer
```

**Status:** ✅ Servidor funcionando
**Base de dados:** ⚠️ Problema de autenticação (verificar credenciais)

