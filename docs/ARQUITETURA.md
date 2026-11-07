# Arquitetura do Moeda Arena

Monólito Express em camadas, frontend estático e proxy Cloudflare separado.
Uma raiz npm e um package-lock.json mantêm instalação e comandos consistentes.

| Pasta | Responsabilidade |
| --- | --- |
| src/backend/routes | Endpoints e associação de middlewares/controladores |
| src/backend/controllers | Coordenação das requisições HTTP |
| src/backend/middlewares | Autenticação, validação e tratamento de erros |
| src/backend/http | Respostas e utilitários de limitação HTTP |
| src/backend/domain | Catálogo e cálculos financeiros sem acesso a infraestrutura |
| src/backend/services | Liquidação transacional de pagamentos |
| src/backend/repositories | Consultas e operações persistentes de usuários, cupons e pagamentos |
| src/backend/database | Pool MySQL e verificação do esquema |
| src/backend/integrations | Adaptadores de e-mail e WhatsApp |
| src/backend/security | Criptografia, assinatura e verificações de segurança |
| src/backend/config | Ambiente e logger |
| src/backend/runtime | Utilitários do ciclo de execução |
| src/frontend | JavaScript fonte exclusivo do navegador |
| src/infrastructure/cloudflare | Proxy HTTP e entrega de arquivos no Cloudflare |
| public | Arquivos acessíveis pelo navegador; nunca guardar segredos aqui |
| database | SQL de instalação do banco |
| scripts | Ferramentas de manutenção e desenvolvimento |
| test | Testes de comportamento, estrutura e dependências |
| docs | Documentação técnica |
| .vscode | Preferências compartilhadas do editor |

## Fluxo e dependências
Rotas chamam controladores; controladores usam serviços, repositórios, domínio
e integrações. Repositórios acessam database. Domínio não depende das demais
camadas. Infraestrutura de persistência e integrações não importam controladores.
Os testes verificam essas fronteiras, caminhos relativos e ciclos de importação.
O frontend fala com a API por HTTP, sem importar código do backend.

## Entradas e caminhos
server.js inicia o backend e gerencia encerramento. src/backend/app.js monta
Express e serve public. .env, certificados relativos e sessão WhatsApp continuam
resolvidos a partir da raiz, independentemente do diretório de execução.
wrangler.jsonc aponta para o proxy e exige BACKEND_ORIGIN. Express/MySQL precisam
estar hospedados separadamente; publicar o proxy não instala o backend.

## Fontes e arquivos gerados
Edite src/frontend/main.js e admin.js e execute npm run build. Os bundles em
public são incluídos para permitir prévia sem instalação. public/style.css é
fonte de style.min.css; admin.css é servido diretamente. Não edite os bundles.

## Escopo
A separação é incremental: ainda existem SDKs e SQL coordenados em controladores.
Não se trata de Clean Architecture completa. A liquidação permanece transacional;
a reorganização não muda o comportamento de pagamento nem migra o banco.
Veja REORGANIZACAO.md para o mapa de movimentações e instalação sem duplicações.
