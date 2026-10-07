# Publicação no Cloudflare Workers

A configuração atual em `wrangler.jsonc` usa `src/worker.mjs` e serve os arquivos de
`public/`. As chamadas `/api/*` são encaminhadas para um servidor Node/Express
separado, que executa `server.js` e acessa o MySQL. Publicar o Worker não hospeda
esse servidor nem o banco de dados.

## Configuração do Workers Builds

No Worker `moeda-arena`, abra **Settings > Build** e confira:

| Campo | Valor |
| --- | --- |
| Diretório raiz | Raiz do repositório, onde estão `package.json` e `wrangler.jsonc` |
| Comando de build | `npm run build` |
| Comando de deploy | `npm run deploy:cloudflare` |

Se uma pasta interna `Moeda-arena` foi removida, retire esse caminho do campo de
diretório raiz. O projeto atual fica na raiz do repositório.

O comando de deploy executa `wrangler deploy`. Também é possível configurar
`npx wrangler deploy` diretamente no painel. Não use `npm start` como build:
ele inicia um servidor persistente.

## Backend e variáveis

1. Hospede o backend Node.js com as variáveis de `.env.example` e `npm start`.
2. Confirme que `https://SEU-BACKEND/api/health` responde HTTP 200.
3. Em **Settings > Variables and Secrets** do Worker, configure `BACKEND_ORIGIN`
   com a origem HTTPS do backend, sem `/api`, caminho, usuário ou senha.
   Use um hostname diferente do domínio do frontend.
4. Confirme a associação do domínio em **Domains & Routes**.

O `.env` local não é enviado automaticamente ao Cloudflare. As credenciais de
banco, autenticação, e-mail e pagamentos pertencem ao serviço Node/Express.
A entrada atual não usa Hyperdrive nem Durable Objects; os arquivos antigos em
`src/cloudflare/` não são a entrada configurada em `wrangler.jsonc`.

## Validação e publicação manual

```sh
npm ci
npm test
npm run build
npm run check:cloudflare
```

`check:cloudflare` empacota o Worker em modo dry-run e não publica.
Para publicar, após configurar a conta e o backend:

```sh
npx wrangler login
npm run deploy:cloudflare
```

## Diagnóstico de falhas

Abra o build com falha no painel e consulte o log:

- `Missing script: deploy:cloudflare`: o commit publicado precisa conter o script
  atualizado em `package.json`.
- Diretório ou `package.json` não encontrado: confira o diretório raiz do build.
- Falha na instalação: confira o gerenciador de pacotes e o lockfile indicado no log.
- HTTP 503 com `BACKEND_NAO_CONFIGURADO`: configure `BACKEND_ORIGIN` no Worker.
- HTTP 502 com `BACKEND_INDISPONIVEL`: confira a disponibilidade do backend.

Após publicar, confira `/api/health`, `/api/auth/config`, `/api/auth/status`,
`/api/planos` e `/api/estatisticas` no domínio do frontend. Valide também login e
logout. Um dry-run bem-sucedido não confirma credenciais, domínio ou banco online.

Referência: [Configuração do Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
