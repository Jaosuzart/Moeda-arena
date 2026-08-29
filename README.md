<h1 align="center">🪙 Moeda Arena — Plataforma de Moedas Virtuais</h1>
<p align="center">
  <em>
    Plataforma web desenvolvida com HTML5, CSS3, Bootstrap, JavaScript, Node.js e integrada ao Mercado Pago para gerenciamento e comercialização de moedas virtuais, planos e benefícios.
  </em>
</p>
<p align="center">
  <a href="https://moedaarena.com.br/">🌐 Acessar o projeto</a>
  •
  <a href="https://github.com/Jaosuzart/Moeda-arena">💻 Repositório</a>
</p>
<p align="center">
  <img width="1290" height="588" alt="image" src="https://github.com/user-attachments/assets/920e69b2-5347-4a8b-b1a6-c86ef4332f17" />
</p>
<hr>
## 📌 Sobre o projeto
A **Moeda Arena** é uma aplicação web desenvolvida para gerenciamento e comercialização de moedas virtuais, planos e benefícios.
O projeto reúne **Front-end, Back-end, banco de dados e integração com serviços externos**, proporcionando uma experiência completa desde o cadastro do usuário até o processo de compra e confirmação do pagamento.
A aplicação utiliza a integração com o **Mercado Pago** para realizar pagamentos via PIX e cartão de crédito, utilizando Webhooks para confirmar as transações e liberar automaticamente as moedas adquiridas.
### ✨ Principais funcionalidades

* 🪙 Compra e gerenciamento de moedas virtuais
* 💳 Pagamentos via Mercado Pago
* 📲 PIX e cartão de crédito
* 🔔 Webhooks para confirmação de pagamentos
* 🎟️ Sistema de cupons
* 🏆 Ranking
* 👤 Cadastro e login de usuários
* 🔐 Autenticação com JWT
* 🛡️ Autenticação em dois fatores (2FA)
* 📧 Envio de e-mails
* 📦 Planos e passes
* ⚙️ API REST
* 🗄️ Banco de dados MySQL/MariaDB
* 📝 Sistema de logs com Winston
---
## 🌐 Projeto publicado
A aplicação está disponível online:
**https://moedaarena.com.br/**
O código-fonte está disponível no GitHub:
**https://github.com/Jaosuzart/Moeda-arena**
---
## 💳 Integração com Mercado Pago
A Moeda Arena utiliza o SDK oficial do Mercado Pago no Node.js para realizar o processamento das compras.
### 🛒 Criação da compra
Quando o usuário realiza uma compra, o sistema:
1. Recebe a solicitação através da API;
2. Valida o usuário e os dados da compra;
3. Verifica possíveis cupons;
4. Calcula o valor final;
5. Cria uma preferência de pagamento;
6. Gera o checkout do Mercado Pago;
7. Redireciona o usuário para realizar o pagamento.

A compra possui uma referência externa (`external_reference`) utilizada para relacionar o pagamento ao usuário e aos dados da compra.
### 🔔 Webhook
Após o pagamento, o Mercado Pago envia uma notificação para a API através do endpoint:

```text
/api/webhook
```

A aplicação então consulta a transação diretamente na API do Mercado Pago e verifica o status real do pagamento.
Quando o pagamento é aprovado:
* O usuário é identificado;
* A compra é validada;
* As moedas são adicionadas ao saldo;
* O pagamento é registrado;
* O uso do cupom é atualizado, quando aplicável.
### 🛡️ Proteção contra duplicidade
O sistema também possui controle de **idempotência**.
Antes de processar uma transação, o `payment_id` é consultado na tabela de pagamentos processados.
Isso evita que uma mesma notificação gere créditos duplicados de moedas.
---
## 🎟️ Sistema de cupons
A plataforma possui um sistema de cupons integrado ao processo de compra.
O sistema permite:
* Validar cupons;
* Verificar sua validade;
* Aplicar descontos;
* Calcular o valor final da compra;
* Registrar a utilização do cupom.
---
## 🔐 Autenticação e segurança

A aplicação utiliza **JWT (JSON Web Token)** para autenticação e proteção das rotas.
Também são utilizados:
* JWT;
* Express Validator;
* Variáveis de ambiente;
* Middleware de autenticação;
* Autenticação em dois fatores (2FA);
* Separação entre rotas públicas e protegidas.
---
# 🚀 Tecnologias utilizadas
### 🎨 Front-end
* HTML5
* CSS3
* Bootstrap 5
* JavaScript ES6
### ⚙️ Back-end
* Node.js
* Express.js
* Mercado Pago SDK
* MySQL / MariaDB
* JWT
* Express Validator
* Winston
* Nodemailer
### ☁️ Serviços
* Aiven Cloud
* Mercado Pago
* GitHub
---
# 📂 Estrutura do projeto
```text
Moeda-arena/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── main.js
│
├── src/
│   ├── config/
│   ├── controllers/
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
--
# 🛠️ Como executar
## 1. Clone o repositório
bash
git clone https://github.com/Jaosuzart/Moeda-arena.git
bash
cd Moeda-arena
## 2. Instale as dependências
bash
npm install
## 3. Configure o `.env`
Crie um arquivo `.env` na raiz:
Env
PORT=3001
NODE_ENV=development
MP_ACCESS_TOKEN=seu_access_token
DB_HOST=seu_host
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
JWT_SECRET=sua_chave_secreta
## 4. Configure o banco
O arquivo `setup_db.js` esteja presente no projeto:
bash
node setup_db.js
## 5. Execute a aplicação
bash
npm run dev
A aplicação estará disponível em:
http://localhost:3001
# 📚 Objetivos do projeto
O desenvolvimento da Moeda Arena também teve como objetivo colocar em prática conhecimentos de:
* Desenvolvimento Front-end;
* Desenvolvimento Back-end;
* Node.js e Express;
* APIs REST;
* Arquitetura MVC;
* Banco de dados;
* Autenticação;
* Segurança;
* Integração com APIs externas;
* Mercado Pago;
* Webhooks;
* Git e GitHub;
* Deploy;
* Serviços em nuvem.
# 👨‍💻 Desenvolvedor
**João Marcelo Suzart Lima Castro**
EstUdante de **Curso Técnico em Desenvolvimento de Sistemas**, desenvolvendo projetos para aprimorar conhecimentos em desenvolvimento web, programação e tecnologias Back-end e Front-end.
<p align="center">
  🪙 <strong>Moeda Arena</strong> — Desenvolvimento, aprendizado e prática.
</p>
