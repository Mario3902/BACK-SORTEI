# Guia de Implantação do Backend no Vercel

Este guia detalha o processo para hospedar seu backend Node.js na Vercel e conectá-lo ao seu frontend.

## ⚠️ Aviso Importante sobre o Vercel para Backends

O Vercel é otimizado para frontends e *Serverless Functions*. Para um backend com conexão persistente a um banco de dados, a plataforma pode apresentar desafios, como timeouts de conexão. Serviços como **Heroku**, **DigitalOcean App Platform** ou um **VPS** são geralmente mais recomendados para este tipo de aplicação. No entanto, se a sua preferência é o Vercel, siga os passos abaixo.

## Parte 1: Preparar o Projeto para o Vercel

O seu projeto já foi preparado com as seguintes modificações:

1.  **Ponto de Entrada Serverless:** Foi criado o arquivo `api/index.js` que exporta sua aplicação Express. O Vercel usará este arquivo para criar a Serverless Function.
2.  **Configuração do Vercel:** O arquivo `vercel.json` foi adicionado para instruir o Vercel sobre como construir e rotear as requisições para sua API.
3.  **Código Adaptado:** O servidor principal (`server-simple.js`) foi ajustado para não iniciar um listener (`app.listen`) quando estiver no ambiente do Vercel.
4.  **`.gitignore`:** Um arquivo `.gitignore` foi criado para garantir que arquivos desnecessários (como `node_modules` e `.env`) não sejam enviados para o seu repositório Git.

## Parte 2: Implantação no Vercel

Siga estes passos para fazer a implantação:

### Passo 1: Subir o Código para o GitHub

Seu projeto precisa estar em um repositório Git (GitHub, GitLab, Bitbucket).

1.  **Crie um repositório no GitHub:** Vá para [github.com/new](https://github.com/new) e crie um novo repositório (pode ser privado).
2.  **Conecte seu projeto local ao repositório:**
    ```bash
    # Navegue até a pasta do seu backend
    cd /caminho/para/bolsa-estudos-backend-nodejs

    # Inicie o git (se ainda não o fez)
    git init

    # Adicione todos os arquivos
    git add .

    # Faça o primeiro commit
    git commit -m "Versão inicial do backend para Vercel"

    # Adicione o repositório remoto do GitHub
    git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

    # Envie o código
    git push -u origin main
    ```

### Passo 2: Fazer o Deploy na Vercel

1.  **Acesse sua conta Vercel:** Vá para [vercel.com](https://vercel.com) e faça login.
2.  **Importe o Projeto:**
    *   No seu dashboard, clique em **"Add New..." -> "Project"**.
    *   Selecione **"Import Git Repository"** e escolha o repositório que você acabou de criar.
3.  **Configure o Projeto:**
    *   **Framework Preset:** O Vercel deve detectar automaticamente que é um projeto Node.js. Se não, selecione **"Other"**.
    *   **Build and Output Settings:** Deixe os padrões. O Vercel usará o `vercel.json` para a configuração.
    *   **Environment Variables (Variáveis de Ambiente):** Esta é a parte mais importante!
        *   Clique para expandir a seção **"Environment Variables"**.
        *   Adicione as seguintes variáveis, uma por uma, com os valores corretos da sua base de dados:
            *   `DB_HOST`: `65.108.244.136`
            *   `DB_USER`: `bolsadae_admin`
            *   `DB_PASSWORD`: `&2K^Tnf{+=jyI)Cq`
            *   `DB_NAME`: `bolsadee_bolsa_estudos`
            *   `DB_PORT`: `3306`
            *   `JWT_SECRET`: Crie uma chave secreta longa e segura (ex: `seu-segredo-super-secreto-para-jwt-123`)

4.  **Clique em "Deploy"**.

O Vercel irá buscar seu código, instalar as dependências e implantar a API. Após a conclusão, você receberá uma URL pública para o seu backend (ex: `https://seu-projeto-backend.vercel.app`).

## Parte 3: Conectar o Frontend ao Backend

Agora que seu backend está no ar, você precisa configurar seu frontend para se comunicar com ele.

1.  **Encontre a URL do seu Backend:** No dashboard do Vercel, vá para o projeto do backend e copie a URL principal (estará em "Domains").

2.  **Configure o Frontend:**
    *   Vá para o projeto do seu **frontend** no Vercel.
    *   Navegue até **"Settings" -> "Environment Variables"**.
    *   Adicione uma nova variável de ambiente. O nome dela dependerá de como seu código frontend está configurado para ler a URL da API. Geralmente, usa-se um nome como:
        *   `NEXT_PUBLIC_API_URL` (para projetos Next.js)
        *   `REACT_APP_API_URL` (para projetos Create React App)
        *   `VITE_API_URL` (para projetos Vite)
    *   No campo **"Value"**, cole a URL do seu backend que você copiou no passo anterior (ex: `https://seu-projeto-backend.vercel.app`).

3.  **Redeploy do Frontend:** Após adicionar a variável de ambiente, você precisa fazer um novo deploy do seu frontend para que ele passe a usar a nova configuração.
    *   Vá para a aba **"Deployments"** do seu projeto frontend.
    *   Encontre o último deploy, clique nos três pontos (...) e selecione **"Redeploy"**.

## Parte 4: Testar a Integração

Após o redeploy do frontend, acesse a URL do seu site e teste as funcionalidades que dependem do backend:

-   Formulário de inscrição
-   Login de administrador
-   Visualização de bolsas

Abra o console do navegador (F12) para verificar se há erros de rede (como erros de CORS ou 404). Se tudo foi configurado corretamente, as requisições do seu frontend para `https://seu-projeto-backend.vercel.app/api/...` deverão funcionar.

## 🐛 Resolução de Problemas Comuns

-   **Erro de CORS:** Se você vir erros de CORS no navegador, verifique se a configuração `cors()` no seu `server-simple.js` está permitindo a origem do seu frontend. A configuração atual (`origin: '*'`) é permissiva, mas em produção, você pode querer restringi-la para a URL do seu frontend.
-   **Erro 500 (Internal Server Error):** Verifique os logs do seu backend no dashboard do Vercel (aba "Logs"). O erro mais provável continua sendo a conexão com o banco de dados. Confirme se as variáveis de ambiente estão corretas e se o seu provedor de banco de dados permite conexões a partir dos IPs do Vercel.
-   **Erro 404 (Not Found):** Verifique se as rotas no seu frontend estão apontando para os endpoints corretos do backend (ex: `/api/applications`, `/api/auth/login`).

