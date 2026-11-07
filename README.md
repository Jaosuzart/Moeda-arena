# Moeda Arena

Projeto Node.js/Express com MySQL, frontend estatico e proxy Cloudflare.

## Abrir o projeto

Extraia o ZIP inteiro em uma pasta nova e abra `Moeda-Arena.code-workspace` no VS Code.
Não extraia por cima da versão anterior. Consulte [docs/REORGANIZACAO.md](docs/REORGANIZACAO.md) para preservar configurações e atualizar seu repositório.
A raiz correta contem `package.json`, `server.js`, `public` e `src`.

## Previa visual

Com Node.js instalado, execute `ABRIR_PREVIA_WINDOWS.cmd` ou:

```bash
npm run preview
```

Use a URL mostrada no terminal. Login e pagamentos exigem o backend completo.

## Preparacao automatica no Windows

Execute `PREPARAR_WINDOWS.cmd` para instalar, compilar e testar. Depois configure `.env`.

## Sistema completo

No terminal aberto na raiz do projeto:

```bash
npm ci
```

Este ZIP privado inclui `.env` recuperado. Leia primeiro [docs/CONFIGURACAO_PRIVADA.md](docs/CONFIGURACAO_PRIVADA.md).
Não substitua suas chaves existentes. Para uma instalação nova sem configuração, use `.env.example`.
No Git Bash, use `cp .env.example .env`; no PowerShell, `Copy-Item .env.example .env`.
Nao sobrescreva um `.env` que ja esteja configurado.

```bash
npm run db:check
npm run build
npm test
npm start
```

Para banco novo, execute `npm run db:setup` antes de `db:check`. Para banco existente,
faça backup, pare a aplicação e execute `npm run db:migrate`.
Leia [docs/ATUALIZACAO.md](docs/ATUALIZACAO.md) antes de substituir o projeto.

Alternativa Windows: `INSTALAR_E_INICIAR_WINDOWS.cmd`.
Para desenvolvimento, `npm run dev` observa somente backend e inicializacao.
O pacote contém compras avulsas de moedas; não implementa assinatura recorrente, anual ou vitalícia.

## Verificacao

```bash
npm run check:syntax
npm test
npm run build
npm run check:cloudflare
```

O ultimo comando exige dependencias Wrangler instaladas. Nenhum desses comandos faz uma compra.

## Organizacao

Consulte [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para as responsabilidades das pastas
e [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) para publicar o proxy com backend separado.
O nome do pacote npm e `moeda-arena`; o nome apresentado ao usuario e **Moeda Arena**.
