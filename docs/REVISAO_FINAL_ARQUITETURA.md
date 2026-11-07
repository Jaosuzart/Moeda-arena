# Revisão arquitetural do Moeda Arena — 29/10/2026

## Ajustes executados
- Eliminado diretório legado `src/backend/models/` que duplicava os repositórios em `src/backend/repositories/` e a conexão em `src/backend/database/`.
- Eliminado diretório legado `src/backend/helpers/` que duplicava `http/`, `security/` e `domain/`.
- Eliminadas cópias sem uso `src/backend/services/emailService.js`, `src/backend/services/whatsappService.js` e `src/backend/runtime/background.js`.
- Mantido `src/backend/services/paymentSettlement.js`, que executa a regra de liquidação de pagamentos.
- Mantida separação entre Express (`src/backend/`), frontend (`src/frontend/`), arquivos publicados (`public/`) e proxy Worker (`src/infrastructure/cloudflare/`). Cloudflare **não** substitui o backend Node/MySQL.

## Segurança importante
- O `.env` original contém credenciais e **foi intencionalmente excluído do ZIP**. Preserve sua cópia privada, fora do Git, e use `.env.example` para provisionar outra máquina.
- O projeto extraído apontava `DB_SSL_CA_FILE` para um certificado não fornecido no RAR. Baixe a CA autêntica no painel do Aiven, instale-a em um caminho privado e ajuste `DB_SSL_CA_FILE`. Não desabilite a verificação TLS para contornar o erro.
- Caso tokens tenham aparecido em mensagens, repositórios públicos ou arquivos compartilhados, revogue/rotacione os valores de Mercado Pago, SMTP e segredos de autenticação e criptografia conforme o impacto. **Preserve ENCRYPTION_KEY** para dados já criptografados; planeje migração antes de qualquer rotação dela.
- Verifique `BACKEND_ORIGIN` em `wrangler.jsonc`: deve ser o endereço público HTTPS real da API Express no Render ou outro host, sem caminho adicional.

## Validação realizada
- `node scripts/check-syntax.cjs`: passou.
- `node --test`: 43 testes passaram e 3 falharam na inicialização porque as dependências npm não estão instaladas neste ambiente (`dotenv`, `express`, entre outras). Não é evidência de que toda a API funciona.
- Não foram realizados testes reais de banco Aiven, Mercado Pago, SMTP, login ou deploy.

## Passos locais (Windows Git Bash, na raiz do projeto)
1. `npm ci`
2. Copie seu `.env` privado anterior para a raiz; nunca execute `git add .env`.
3. Baixe o certificado CA original do Aiven e confira o caminho `DB_SSL_CA_FILE`.
4. `npm run check:env`
5. `npm run check:syntax`
6. `npm test`
7. `npm run build`
8. `npm run db:check`
9. `npm start` (a porta será a configurada em `PORT`).
10. Só depois de validar o checkout de teste, o webhook e o backend em HTTPS, considere `npx wrangler deploy`.

**Atenção**: realizar `npm run deploy` publica alterações. Faça isso somente após os testes e sua decisão de publicar.
