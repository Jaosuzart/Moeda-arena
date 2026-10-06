# Publicação na Cloudflare Workers

O site usa um Worker com as rotas Express e os arquivos de `public` no mesmo domínio.
O `server.js` continua sendo a entrada para Node.js local; na Cloudflare a entrada é
`src/cloudflare/worker.mjs`. Não publique apenas `public` como site estático/Pages.
Os cabeçalhos de segurança dos arquivos estáticos ficam em `public/_headers`; a API
continua usando Helmet. A compressão da API fica a cargo da borda da Cloudflare.

## Configuração necessária antes da publicação

1. Execute `npx wrangler login` na sua máquina e entre na conta que possui o site.
2. No painel Cloudflare, crie uma configuração **Hyperdrive** para o MySQL/MariaDB
   existente, usando os dados `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
   Configure TLS e o certificado exigido pelo provedor. **Desative o cache de consultas**:
   autenticação, bloqueios, pagamentos e saldo precisam ler o estado atual do banco.
   Isso mantém o banco atual; não migra os dados para D1.
3. Copie o ID real para `wrangler.jsonc`, descomentando e preenchendo:

   ```json
   "hyperdrive": [{ "binding": "HYPERDRIVE", "id": "ID_REAL" }]
   ```

4. Nas configurações do Worker `moeda-arena`, cadastre estas variáveis/segredos:

   | Nome | Uso |
   | --- | --- |
   | `CLIENT_ID_GOOGLE` | Client ID público do Google, terminando em `.apps.googleusercontent.com` |
   | `JWT_SECRET` | Mesma chave JWT do servidor existente |
   | `ENCRYPTION_KEY` | **Mesma chave existente**, necessária para ler os dados criptografados |
   | `API_GAME_SECRET` | Mesma chave usada pelo jogo |
   | `MP_ACCESS_TOKEN` | Token privado do Mercado Pago |
   | `MP_WEBHOOK_SECRET` | Validação das notificações de pagamento |
   | `ADMIN_EMAIL` | E-mail da conta administrativa |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Envio de e-mails; aliases `EMAIL_USER`/`EMAIL_PASS` também são aceitos |
   | `WHATSAPP_URL`, `WHATSAPP_NUMBER`, `TELEGRAM_URL`, `MIXPANEL_TOKEN` | Opcionais |

   Use o tipo **Secret** para senhas, tokens privados e chaves. O `.env` local não é
   automaticamente enviado à Cloudflare. Não coloque segredos em `public` nem em `vars`.
   `keep_vars` preserva variáveis já cadastradas no painel. `NODE_ENV=production` e
   `CORS_ORIGIN=https://moedaarena.com.br` estão definidos no Wrangler; ajuste a origem
   se o domínio real for diferente.

5. No Google Cloud, mantenha o domínio público em **Origens JavaScript autorizadas**
   do cliente OAuth usado em `CLIENT_ID_GOOGLE`. Não precisa colocar o Client Secret
   no navegador. O backend continua verificando o ID token com o mesmo Client ID.
6. Execute:

   ```sh
   npm ci
   npm test
   npm run build
   npm run test:cloudflare
   npm run deploy:cloudflare
   ```

   No Workers Builds, use `npm run build` para build e `npm run deploy:cloudflare`
   para deploy. Não use o antigo build com Puppeteer: não há navegador no Worker.

7. Confirme que o domínio existente está associado a esse **Worker** em Domains & Routes.
   Se estiver em um projeto Pages antigo, faça a troca de domínio após validar o Worker.
   As chamadas `/api/*` precisam chegar ao mesmo Worker que serve o site.

## Verificação

- `/api/health`: HTTP 200 e JSON com `status: "ok"` (confirma o Worker, não o banco).
- `/api/auth/config`: HTTP 200 e `clientId` preenchido, sem segredos privados.
- `/api/auth/status`: HTTP 200 e `autenticado: false` sem sessão.
- `/api/planos`: HTTP 200 com os planos.
- `/api/estatisticas`: HTTP 200 após o Hyperdrive conseguir consultar o banco.

Se faltar configuração essencial, operações que dependem dela retornam 503 com
`CONFIGURACAO_INCOMPLETA`, e Workers Logs informa os **nomes** faltantes. Não aparecem
mais como arquivos estáticos inexistentes. O frontend só inicia o Google com um Client ID
válido na resposta da API e permite tentar novamente após falhas.

`npm run test:cloudflare` usa o simulador local, credenciais fictícias e nenhum banco
real. Verifica as rotas públicas, os arquivos estáticos, o erro por banco não configurado
e o contador compartilhado. Login real, consultas SQL, SMTP e pagamentos precisam de
validação na conta configurada. Bcrypt pode exigir o plano Workers Paid pelo tempo de CPU;
não reduza a segurança das senhas para caber no limite gratuito.

## Integrações e limites

- **MySQL:** use `mysql2` 3.13 ou superior via Hyperdrive. Não há pool global de sockets
  no Worker; cada operação abre uma conexão e a fecha. Transações preservam a mesma
  conexão até `commit`/`rollback`. O Hyperdrive mantém seu próprio pool.
- **Tentativas de login:** contadores em Durable Objects, compartilhados entre instâncias.
  O limite de 2FA usa o usuário do desafio JWT validado, inclusive ao gerar novos desafios.
- **E-mail:** o transporte Nodemailer foi mantido e o envio é associado a `waitUntil`.
  Valide SMTP no Workers com seu provedor. Prefira TLS direto na porta 465; a porta 25
  é bloqueada e STARTTLS na 587 depende da compatibilidade do transporte. Não desative TLS.
- **WhatsApp:** links de atendimento continuam funcionando. O bot Baileys não roda no
  Worker; mensagens automáticas de recibo pelo WhatsApp ficam indisponíveis nessa entrada.
  Recibos continuam por e-mail. Para reativar mensagens automáticas mantendo Workers,
  é necessária uma integração HTTP (como a API oficial do WhatsApp), com credenciais
  e modelos aprovados. O bot original continua disponível no servidor Node local.
- **Monitoramento:** Workers Logs está habilitado. O SDK Sentry para Node permanece
  apenas na entrada Node e não é carregado no Worker.

Referências: [Express/HTTP no Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/),
[MySQL e Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/mysql-drivers-and-libraries/mysql2/),
[cache de consultas](https://developers.cloudflare.com/hyperdrive/concepts/query-caching/).
