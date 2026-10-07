# 🪙 Moeda Arena — Plataforma de Moedas Virtuais

## Publicacao no Cloudflare Workers

O frontend depende do servidor Node/Express e do MySQL. Publicar apenas `public/` nao executa
`server.js` e causa HTTP 404 em `/api/auth/status`, `/api/estatisticas`, `/api/planos` e
`/api/auth/config`.

O `wrangler.jsonc` agora executa `src/worker.mjs` para `/api` e `/api/*` e serve os demais arquivos
pelo binding `ASSETS`. O Worker encaminha a API ao Express, preservando metodo, corpo, query string
e cookies, sem cachear respostas da API.

1. Hospede o backend como servico Node.js, com `npm start` e as variaveis de `.env.example`.
   Confirme que `https://SEU-BACKEND/api/health` responde HTTP 200.
2. No Worker, configure `BACKEND_ORIGIN` como a origem HTTPS desse servico (sem `/api`, caminho ou
   query string). Use um hostname diferente do frontend para evitar encaminhamento recursivo. Nao
   coloque credenciais nessa URL. No painel Cloudflare, use Settings > Variables and Secrets. Pela
   CLI: `npx wrangler secret put BACKEND_ORIGIN`.
3. Publique a configuracao e o Worker com `npx wrangler deploy`.
4. Verifique `/api/health`, `/api/auth/status`, `/api/auth/config`, `/api/planos` e
   `/api/estatisticas` no dominio do frontend e teste login/logout.

Para desenvolvimento com Wrangler, crie `.dev.vars` (nao versionado) com
`BACKEND_ORIGIN=http://127.0.0.1:3001`, inicie o Express e rode `npx wrangler dev`. Execute
`npm test` para validar o proxy e os testes existentes.

Sem uma origem valida, a API retorna JSON com HTTP 503 e codigo `BACKEND_NAO_CONFIGURADO`. Falha de
conexao retorna HTTP 502 e codigo `BACKEND_INDISPONIVEL`. O backend continua necessario para
autenticacao, estatisticas, planos, pagamentos e acesso ao banco.

## Manutenção local

No Git Bash do Windows, execute:

```bash
cd "C:/Users/Cassio/Documents/Moeda-arena"
source ./scripts/activate-node.sh
npm start
```

O script procura Node.js em `.cache/node-v24.19.0-win-x64/`, no PATH, na instalação padrão do
Windows e no runtime do Codex. O npm depende da instalação escolhida; se apenas Node estiver
disponível, inicie com `node server.js`. Repita o comando `source` ao abrir outro terminal.
Alternativamente, execute `iniciar.cmd` no Windows. A distribuição local não é versionada; em outra
máquina instale Node.js LTS pelo [site oficial do Node.js](https://nodejs.org/) e reabra o terminal
antes de usar `npm`. `node: command not found` e `npm: command not found` indicam runtime ausente do
PATH. Para desenvolvimento com reinício automático, use `npm run dev`. Com `npm start`, o terminal
deve mostrar `moeda-arena@2.0.0` e iniciar `server.js`. Com `iniciar.cmd` ou `node server.js`, os
logs do servidor aparecem diretamente. O `.env` é carregado da raiz do projeto; variáveis já
definidas no ambiente têm prioridade. Após editar o `.env`, reinicie o processo. Não envie senhas
para o Git.

- `Access denied`: confira o usuário e a senha atuais do banco no provedor e em
  `DB_USER`/`DB_PASSWORD`.
- Se a senha contiver `#`, coloque o valor completo entre aspas no `.env`.
- Porta ocupada: encerre a outra instância ou escolha uma `PORT` livre. O servidor não encerra
  outros programas.
- `PORT` e `DB_PORT` precisam ser inteiros de 1 a 65535; `DB_CONN_LIMIT` deve ser um inteiro
  positivo.
- Execute `npm test` para verificar os casos de configuração, banco, encerramento e erros HTTP sem
  serviços externos.
- Após alterar `src/frontend`, execute `npm run minify:js` para atualizar os arquivos usados pelo
  site.
- Em produção, use `NODE_ENV=production`, `TRUST_PROXY=1` quando houver exatamente um proxy reverso
  e mantenha a validação TLS habilitada.
- Alterações de senha revogam automaticamente as sessões JWT anteriores. Códigos 2FA e tokens de
  recuperação não são armazenados em texto puro.

Plataforma web desenvolvida com HTML5, CSS3, Bootstrap, JavaScript, Node.js e integrada ao Mercado
Pago para gerenciamento e comercialização de moedas virtuais, planos e benefícios.

[🌐 Acessar o projeto](https://moedaarena.com.br/) ·
[💻 Repositório](https://github.com/Jaosuzart/Moeda-arena)

![Página inicial do Moeda Arena](https://github.com/user-attachments/assets/8c05a91e-3299-4c81-886a-3c2995029867)
---

## 📌 Sobre o projeto

A **Moeda Arena** é uma aplicação web desenvolvida para gerenciamento e comercialização de moedas
virtuais, planos e benefícios. O projeto reúne **Front-end, Back-end, banco de dados e integração
com serviços externos**, proporcionando uma experiência completa desde o cadastro do usuário até o
processo de compra e confirmação do pagamento. A aplicação utiliza a integração com o **Mercado
Pago** para realizar pagamentos via PIX e cartão de crédito, utilizando Webhooks para confirmar as
transações e liberar automaticamente as moedas adquiridas.

### ✨ Principais funcionalidades

- 🪙 Compra e gerenciamento de moedas virtuais
- 💳 Pagamentos via Mercado Pago
- 📲 PIX e cartão de crédito
- 🔔 Webhooks para confirmação de pagamentos
- 🎟️ Sistema de cupons
- 🏆 Ranking
- 👤 Cadastro e login de usuários
- 🔐 Autenticação com JWT
- 🛡️ Autenticação em dois fatores (2FA)
- 📧 Envio de e-mails
- 📦 Planos e passes
- ⚙️ API REST
- 🗄️ Banco de dados MySQL/MariaDB
- 📝 Sistema de logs com Winston

---

## 🌐 Projeto publicado

A aplicação está disponível online: [Moeda Arena](https://moedaarena.com.br/)

O código-fonte está disponível no GitHub: [Repositório no GitHub](https://github.com/Jaosuzart/Moeda-arena)
---

## 💳 Integração com Mercado Pago

A Moeda Arena utiliza o SDK oficial do Mercado Pago no Node.js para realizar o processamento das
compras.

### 🛒 Criação da compra

Quando o usuário realiza uma compra, o sistema:

1. Recebe a solicitação através da API;
2. Valida o usuário e os dados da compra;
3. Verifica possíveis cupons;
4. Calcula o valor final;
5. Cria uma preferência de pagamento;
6. Gera o checkout do Mercado Pago;
7. Redireciona o usuário para realizar o pagamento.

A compra possui uma referência externa (`external_reference`) assinada pelo servidor. Ela relaciona
pagamento, usuário, plano, moeda e valor esperado sem confiar em dados enviados pelo navegador.

### 🔔 Webhook

Após o pagamento, o Mercado Pago envia uma notificação para a API através do endpoint:

```text
/api/webhook/mercadopago
```

A aplicação então consulta a transação diretamente na API do Mercado Pago e verifica o status real
do pagamento. Quando o pagamento é aprovado:

- O usuário é identificado;
- A compra é validada;
- As moedas são adicionadas ao saldo;
- O pagamento é registrado;
- O uso do cupom é atualizado, quando aplicável.

### 🛡️ Proteção contra duplicidade

O sistema também possui controle de **idempotência**. O `payment_id` possui índice único e é
inserido na mesma transação que credita as moedas. Isso evita condições de corrida e impede que uma
mesma notificação gere créditos duplicados.
---

## 🎟️ Sistema de cupons

A plataforma possui um sistema de cupons integrado ao processo de compra. O sistema permite:

- Validar cupons;
- Verificar sua validade;
- Aplicar descontos;
- Calcular o valor final da compra;
- Registrar a utilização do cupom.

---

## 🔐 Autenticação e segurança

A aplicação utiliza **JWT (JSON Web Token)** para autenticação e proteção das rotas. Também são
utilizados:

- JWT;
- Express Validator;
- Variáveis de ambiente;
- Middleware de autenticação;
- Autenticação em dois fatores (2FA);
- Separação entre rotas públicas e protegidas.

---

## 🚀 Tecnologias utilizadas

### 🎨 Front-end

- HTML5
- CSS3
- Bootstrap 5
- JavaScript ES6

### ⚙️ Back-end

- Node.js
- Express.js
- Mercado Pago SDK
- JWT
- Express Validator
- Winston
- Nodemailer

### ☁️ Serviços

- Aiven Cloud
- Mercado Pago
- GitHub

---

## 📂 Estrutura do projeto

```text
Moeda-arena/
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── main.min.js
│   ├── admin.min.js
│   └── _headers
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── frontend/
│   ├── helpers/
│   ├── middlewares/
│   ├── models/
│   └── routes/
│
├── server.js
├── package.json
├── package-lock.json
└── .env
```

---

## 🛠️ Como executar

1. Instale Node.js LTS com npm pelo [site oficial do Node.js](https://nodejs.org/) e reabra o
   terminal.
2. Entre na pasta do projeto. Se usar o runtime portátil desta cópia, execute
   `source ./scripts/activate-node.sh` no Git Bash.
3. Instale dependências com `npm ci` usando `package-lock.json`.
4. Copie `.env.example` para `.env` caso ainda não exista e preencha todos os valores obrigatórios,
   incluindo `API_GAME_SECRET` e `ENCRYPTION_KEY`. Preserve um `.env` já configurado.
5. Configure o banco MySQL/MariaDB e suas tabelas no provedor. Esta cópia não contém `setup_db.js`
   nem um script completo de criação de tabelas.
6. Execute `npm test` e `npm run build`. O build gera JavaScript e CSS em `public/`; a instalação
   das dependências é uma etapa separada.
7. Execute `npm start` ou `npm run dev`. A URL usa a `PORT` definida no `.env` (por exemplo,
   http://localhost:3001). O servidor testa o banco antes de abrir a porta.

## 📚 Objetivos do projeto

O desenvolvimento da Moeda Arena também teve como objetivo colocar em prática conhecimentos de:

- Desenvolvimento Front-end;
- Desenvolvimento Back-end;
- Node.js e Express;
- APIs REST;
- Arquitetura MVC;
- Banco de dados;
- Autenticação;
- Segurança;
- Integração com APIs externas;
- Mercado Pago;
- Webhooks;
- Git e GitHub;
- Deploy;
- Serviços em nuvem.

## 👨‍💻 Desenvolvedor

**João Marcelo Suzart Lima Castro** Estudante de **Curso Técnico em Desenvolvimento de Sistemas**,
desenvolvendo projetos para aprimorar conhecimentos em desenvolvimento web, programação e
tecnologias Back-end e Front-end. 🪙 **Moeda Arena** — Desenvolvimento, aprendizado e prática.
