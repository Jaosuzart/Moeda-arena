<h1 align="center">🎮 Jogo Arena — Integração Mercado Pago</h1>
<p align="center">
  <em>Projeto web MVC desenvolvido com HTML5, CSS3, Bootstrap, JavaScript, Node.js e integrado com a API do Mercado Pago para vendas de tokens e planos de benefícios.</em>
</p>
<p align="center">
  <img width="1290" height="588" alt="image" src="https://github.com/user-attachments/assets/920e69b2-5347-4a8b-b1a6-c86ef4332f17" />
</p>
<hr>

📌 Sobre o projeto
O <strong>Jogo Arena</strong> é uma aplicação web completa desenvolvida com arquitetura MVC. O objetivo central do projeto é demonstrar a integração de um fluxo de vendas ponta a ponta utilizando a API oficial do <strong>Mercado Pago</strong>, permitindo que usuários comprem pacotes de "Tokens" (moedas do jogo) e assinem "Passes" de forma automatizada e segura via PIX ou Cartão de Crédito.

---

💳 Integração Detalhada com o Mercado Pago

A aplicação utiliza o SDK oficial do Mercado Pago (`mercadopago`) no Node.js. O fluxo financeiro e de entrega digital é composto por duas etapas principais:

### 1. Geração de Preferência de Pagamento (`compraController.js`)

Quando o usuário clica em assinar um pacote de benefícios ou comprar tokens, o sistema envia uma requisição autenticada para a rota `/api/comprar`.

- **Validação de Cupons**: Se o usuário aplicar um cupom de streamer (`STREAMER10`), o sistema valida a validade do cupom no banco de dados e calcula o valor final com desconto.
- **Criação da Preferência**: O servidor inicia o cliente do Mercado Pago com o token de acesso (`MP_ACCESS_TOKEN`) e cria uma preferência de pagamento contendo:
  - O item comprado (ID, título, quantidade e preço final com desconto).
  - As URLs de retorno (`back_urls`): rotas de sucesso, pendente e falha apontando para o frontend da aplicação.
  - O **`external_reference`**: Um objeto JSON serializado contendo o `usuarioId`, `planoId`, a quantidade de `tokens` a serem creditados e o `cupom` utilizado. Este campo é fundamental para que o sistema reconheça o comprador após o pagamento.
- **Redirecionamento**: O Mercado Pago retorna um ID de preferência e um link de checkout seguro (`init_point`). O frontend recebe esse link e redireciona o usuário para realizar o pagamento.

### 2. Processamento de Notificação e Webhook (`webhookController.js`)

Uma vez efetuado o pagamento (seja via Pix ou Cartão de Crédito), o Mercado Pago dispara uma notificação assíncrona HTTP POST para a rota pública `/api/webhook`.

- **Idempotência (Prevenção de Gastos Duplicados)**: Para cada webhook recebido, o sistema consulta a tabela `pagamentos_processados` para validar se o `payment_id` já foi tratado. Se já estiver registrado, o processamento é imediatamente interrompido para evitar créditos de tokens duplicados.
- **Consulta à API do Mercado Pago**: O servidor consome a API do Mercado Pago (`paymentApi.get`) utilizando o ID do pagamento recebido na notificação para obter os detalhes oficiais e seguros da transação direta.
- **Aprovação e Crédito**: Caso o status do pagamento retornado seja `approved` (aprovado):
  - O payload do `external_reference` é decodificado para identificar os dados da compra.
  - O saldo do usuário no banco de dados é atualizado (`usuarioModel.adicionarTokens`).
  - O pagamento é registrado na tabela `pagamentos_processados` marcando a transação como concluída.
  - O uso do cupom do streamer é incrementado (`cupomModel.incrementarUso`), registrando as métricas para a comissão do streamer.

---

🚀 Tecnologias utilizadas

🎨 Front-end

- **HTML5** e **CSS3** (CSS customizado moderno)
- **Bootstrap 5** (Layout e componentes de interface)
- **JavaScript ES6** (Interações dinâmicas e consumo da API interna)

⚙️ Back-end

- **Node.js** com framework **Express**
- **Mercado Pago SDK** (Integração de pagamentos)
- **MySQL / MariaDB** (Armazenamento persistente no Aiven Cloud)
- **Winston** (Logging estruturado e centralizado)
- **JSON Web Token (JWT)** (Autenticação e sessões seguras)
- **Nodemailer** (Disparo automático de e-mails de confirmação de conta)

---

📂 Estrutura do projeto

```text
Jogo-Arena/
├── public/                 # Interface Pública (Front-end)
│   ├── index.html          # Interface principal e modals (Auth, Checkout, Termos, Ranking)
│   ├── style.css           # Estilização moderna e layout responsivo
│   └── main.js             # Funções de interação com o usuário, consumo da API e Google Auth
│
├── src/                    # Lógica do Servidor (Back-end)
│   ├── config/             # Configurações globais (Winston logger e variáveis de ambiente)
│   ├── controllers/        # Controladores de negócio (Autenticação, Compras, Webhook, Rankings)
│   ├── helpers/            # Utilitários de resposta formatada da API
│   ├── middlewares/        # Validadores de segurança (JWT e Express Validator)
│   ├── models/             # Queries SQL estruturadas (Usuários, Planos, Cupons, Conexão DB)
│   └── routes/             # Definição e proteção das rotas da API REST
│
├── server.js               # Arquivo principal do servidor com Graceful Shutdown
└── package.json            # Gerenciador de dependências e scripts do Node.js
```

---

🛠️ Como executar o projeto

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto contendo as credenciais de desenvolvimento e produção:

```env
PORT=3001
NODE_ENV=development

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token_de_teste

# Banco de Dados
DB_HOST=seu_host_do_banco
DB_PORT=porta_conexao
DB_USER=usuario_banco
DB_PASSWORD=senha_banco
DB_NAME=nome_banco

# Autenticação
JWT_SECRET=chave_secreta_jwt
```

### 2. Instalar e rodar

No terminal, acesse a pasta raiz e execute os comandos:

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar as tabelas do banco de dados e inserir usuários de teste
node setup_db.js

# 3. Iniciar o servidor em ambiente de desenvolvimento
npm run dev
```

Acesse a aplicação no navegador em: `http://localhost:3001`
d
