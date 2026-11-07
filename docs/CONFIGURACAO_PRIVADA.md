# Configuração privada — situação real da entrega

Este pacote inclui .env recuperado do arquivo moeda-arena.env. Os valores não
foram reimpressos em documentação. JWT_SECRET, API_GAME_SECRET e ENCRYPTION_KEY
foram preservados. Não substitua ENCRYPTION_KEY em um banco já em uso.
As credenciais recuperadas podem estar desatualizadas; preenchimento não comprova validade.
WHATSAPP_ENABLED=false evita iniciar pareamento automaticamente.
O endereço BACKEND_ORIGIN salvo foi adicionado a vars do Wrangler; nenhum segredo
foi adicionado à configuração do Worker. O .env configura Node, não as credenciais
no painel Render/Cloudflare.

## Bloqueio confirmado
O .env indica src/backend/config/aiven-ca.pem, mas esse certificado não está
no projeto nem nos dois ZIPs anteriores consultados. Baixe o CA original do seu
serviço MySQL no provedor e coloque nesse caminho. Não use certificado inventado
e não desative DB_SSL_REJECT_UNAUTHORIZED. O comando check:env bloqueará o início
até o arquivo ser fornecido. Não foi comprovada a conexão com MySQL.

## Executar
1. Extraia em uma pasta nova e abra Moeda-Arena.code-workspace.
2. Coloque o certificado CA original em src/backend/config/aiven-ca.pem.
3. Execute npm ci e npm run check:env.
4. Execute npm run db:check para verificar conexão e esquema, sem migrar dados.
5. Execute npm run build, npm test e npm start.
6. Abra http://localhost:3001 quando o terminal confirmar a inicialização.

O .env recuperado está configurado para produção, incluindo CORS_ORIGIN remoto.
Para desenvolvimento local, altere NODE_ENV=development e
CORS_ORIGIN=http://localhost:3001; links de e-mail e callbacks acompanharão essa
origem. Webhooks externos precisam de um endereço HTTPS alcançável. Não considere
um checkout local prova de funcionamento de webhook em produção.

Para uma prévia visual sem MySQL, use npm run preview. Não executa login/pagamentos.
O Worker continua dependendo do backend Node/Express hospedado separadamente.
Não foi feita publicação nem migração automática. TRUST_PROXY foi preservado e
precisa corresponder à topologia real antes da liberação pública.

## Proteção dos arquivos
Este ZIP contém credenciais: mantenha-o privado. O .env permanece no .gitignore.
Isso não retira um arquivo que já tenha sido versionado: verifique git ls-files .env
antes de enviar ao GitHub. O token Mercado Pago já compartilhado em conversa deve
ser substituído no provedor e atualizado no .env antes de uso público; a troca não
foi feita aqui. Não troque a chave de criptografia junto com esse token.

## Limites da revisão
Organização e dependências foram verificadas pelos testes. Controladores ainda
coordenam persistência e SDKs; não se afirma desacoplamento completo. Credenciais,
SMTP, OAuth, webhook, disponibilidade remota e SQL real exigem homologação.
