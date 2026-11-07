# Atualizar o Moeda Arena

## Antes de substituir arquivos

Faça backup da pasta atual e do banco. Extraia este ZIP em uma nova pasta.
Não misture com arquivos antigos e não substitua a pasta `.git` de seu repositório.
As credenciais reais, sessões de WhatsApp e dependências não estão neste pacote.
Copie seu `.env` existente somente para a nova pasta local, sem adicioná-lo ao Git.
Preserve especialmente `ENCRYPTION_KEY`: mudar essa chave impede ler campos já
criptografados. Preservar `JWT_SECRET` também mantém válidas referências de compras
pendentes assinadas com a versão anterior. Se uma chave estiver comprometida,
planeje a troca com reconciliação das compras pendentes e dos dados criptografados.

## Preparação no Windows

Abra a pasta que contém `package.json` no VS Code. Execute:

```sh
npm ci
npm run check:syntax
npm test
npm run build
```

Se ainda não possui `.env`, copie `.env.example` e configure os campos. As chaves
exemplificadas não são credenciais válidas. O remetente SMTP precisa estar configurado
para confirmação de e-mail e recuperação de senha. O WhatsApp inicia somente com
`WHATSAPP_ENABLED=true`; não é necessário para creditar pagamentos.

## Banco existente

Com backup feito e a aplicação parada:

```sh
npm run db:migrate
npm run db:check
npm start
```

A migração não apaga contas ou pagamentos. Ela cria tabelas ausentes, adiciona
unicidade em `payment_id`, permite os status de estorno e altera saldos para inteiros
com sinal. DDL no MySQL faz commits implícitos: uma falha pode exigir retomar a
migração após corrigir o motivo. Duplicidades no histórico bloqueiam a migração;
não há exclusão automática. Todos os envolvidos na liquidação precisam usar InnoDB.
Tabelas existentes com estrutura diferente precisam de adaptação por quem administra
seu banco. O banco deste usuário não foi acessado ou migrado nesta revisão.

Para um banco vazio já criado, use `npm run db:setup` em vez de `db:migrate`.
O schema está em `database/schema.sql`. A inicialização do servidor verifica os
requisitos principais do esquema de pagamentos e falha se eles não forem atendidos.

## Como funcionam as compras corrigidas

- Preços promocionais: Iniciante R$ 2,99, Profissional R$ 4,99 e Lenda R$ 9,99.
- Cada pagamento é uma compra avulsa. Não há assinatura automática, anual ou vitalícia.
- A oferta tem preço em centavos e snapshot de moedas assinado pelo servidor.
- O redirecionamento ao Mercado Pago usa a mesma aba, evitando bloqueio de pop-up.
- Cupons usam o mesmo arredondamento no navegador e no servidor. Cupom indisponível
  impede a compra, em vez de cobrar silenciosamente o valor integral.
- O webhook consulta o pagamento no provedor e valida assinatura, valor, moeda e referência.
- Saldo, comissão e contador de cupom são confirmados na mesma transação.
- Reenvios aplicam somente a diferença entre o crédito já registrado e o crédito devido.
- Estorno parcial retira moedas proporcionalmente, arredondando o saldo líquido para baixo.
  Estorno integral e chargeback removem o crédito e a comissão correspondentes.
- Mediação suspende moedas e comissão; aprovação posterior mais recente restaura os valores.
- Se moedas já tiverem sido gastas, o ajuste pode deixar saldo negativo. Isso impede
  novos gastos até haver saldo suficiente; créditos futuros compensam o ajuste.
- O sistema NÃO inicia reembolso financeiro: apenas reage ao estado confirmado pelo provedor.
- Benefício gratuito é resgatável uma vez. Cadastro novo começa com zero moedas;
  as 100 moedas são creditadas no resgate, sem duplicar o bônus inicial.

## Pagamentos anteriores à migração

O código antigo não guardava um snapshot completo das comissões. Se um pagamento
já existir em `pagamentos_processados` sem registro em `pagamento_saldos`, o sistema
retorna erro e registra `PAGAMENTO_LEGADO`, sem creditar novamente ou presumir um estorno.
O administrador precisa conferir esse histórico no Mercado Pago e no banco antes
de reconciliar moedas e comissão. Novas compras usam o fluxo transacional completo.
Não apague pagamentos antigos ou crie snapshots com valores presumidos.

## Produção

Configure `CORS_ORIGIN` com a origem HTTPS pública do frontend, sem barra final.
Configure `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` no serviço Node/Express.
No Mercado Pago, o endereço de webhook é:

`https://SEU-DOMINIO/api/webhook/mercadopago`

O checkout também informa esse endereço na preferência. Use credenciais e compradores
de teste compatíveis com o ambiente do provedor e valide uma compra de ponta a ponta.
Uma aprovação exibida no navegador não é prova de que o banco recebeu as moedas.

No Cloudflare, defina `BACKEND_ORIGIN` para a origem HTTPS do backend separado,
sem `/api`. O comando de deploy não impõe mais um endereço fixo do Render.
Não coloque credenciais do banco ou pagamento no frontend ou no Worker proxy.
Leia `CLOUDFLARE.md`. Nenhuma hospedagem foi alterada por esta entrega.
