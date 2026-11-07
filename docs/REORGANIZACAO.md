# Reorganização de pastas — 29/10/2026

## Abrir corretamente no VS Code
Extraia em uma pasta nova e abra Moeda-Arena.code-workspace. Não extraia por cima
da versão antiga: arquivos removidos do ZIP permaneceriam na pasta anterior.
A raiz aberta deve conter package.json, server.js, src e public. A configuração
explorer.compactFolders=false separa visualmente os níveis no Explorer; pastas
compactadas são uma apresentação do editor, não um erro de importação.

Preserve seu .env, certificados e sessões locais antes de trocar de pasta.
Não apague nem substitua o .git do seu repositório. Para atualizar o checkout,
use uma branch, confira o diff e remova somente os caminhos antigos listados aqui
após copiar seus substitutos. Não mantenha dois backends ativos.

## Movimentações

| Antes (src/backend/) | Depois (src/backend/) |
| --- | --- |
| `models/db.js` | `database/db.js` |
| `models/schema.js` | `database/schema.js` |
| `models/planoModel.js` | `domain/planoCatalog.js` |
| `models/usuarioModel.js` | `repositories/usuarioRepository.js` |
| `models/cupomModel.js` | `repositories/cupomRepository.js` |
| `models/pagamentoModel.js` | `repositories/pagamentoRepository.js` |
| `services/emailService.js` | `integrations/emailService.js` |
| `services/whatsappService.js` | `integrations/whatsappService.js` |
| `helpers/paymentAmounts.js` | `domain/paymentAmounts.js` |
| `helpers/security.js` | `security/security.js` |
| `helpers/crypto.js` | `security/crypto.js` |
| `helpers/apiResponse.js` | `http/apiResponse.js` |
| `helpers/rateLimit.js` | `http/rateLimit.js` |
| `helpers/background.js` | `runtime/background.js` |

A cópia create-ethereal.js da raiz foi eliminada; use npm run email:test-account
(solicita uma conta de teste externa). CLOUDFLARE.md da raiz agora apenas aponta
para o documento único. As referências de fontes, scripts e mocks foram atualizadas.
Não foram alterados endpoints, preços, credenciais ou SQL nesta reorganização.

## Limites reais
A organização em pastas não elimina sozinha o acoplamento lógico. Os controladores
ainda coordenam SDKs e persistência; compraController usa uma conexão transacional.
O próximo passo, se necessário, é extrair casos de uso e injetar gateways/repositórios
com testes de contrato. Esta entrega não afirma implementar Clean Architecture completa.
