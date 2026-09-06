const planosGames = Object.freeze([
  Object.freeze({
    id: "gratis",
    nome: "Passe Amador",
    precoMensal: 0,
    precoAnual: 0,
    moedas: 100,
    recursos: Object.freeze(["100 Moedas Iniciais", "Acesso à Liga Amadora", "1 Personagem Padrão"]),
    flags: Object.freeze(["FREE_TIER"]),
    popular: false,
    isGratis: true,
  }),
  Object.freeze({
    id: "iniciante",
    nome: "Passe Iniciante",
    precoMensal: 499,
    precoAnual: 4990,
    moedas: 1000,
    recursos: Object.freeze(["1.000 Moedas/mês", "Acesso ao Mercado da Comunidade", "1 Skin de Arma Épica"]),
    flags: Object.freeze(["COMMUNITY_MARKET"]),
    popular: false,
    isGratis: false,
  }),
  Object.freeze({
    id: "premium",
    nome: "Passe Profissional",
    precoMensal: 1990,
    precoAnual: 19900,
    moedas: 5000,
    recursos: Object.freeze(["5.000 Moedas/mês", "Conjuntos de Personagens Épicos", "Torneios e Ligas Exclusivas"]),
    flags: Object.freeze(["COMMUNITY_MARKET", "TOURNAMENT_ACCESS"]),
    popular: true,
    isGratis: false,
  }),
  Object.freeze({
    id: "vip",
    nome: "Sócio Lenda",
    precoMensal: 3990,
    precoAnual: 39900,
    moedas: 15000,
    recursos: Object.freeze(["15.000 Moedas/mês", "Todos os Personagens Desbloqueados", "Taxa Zero no Mercado + Sem Anúncios"]),
    flags: Object.freeze(["COMMUNITY_MARKET", "TOURNAMENT_ACCESS", "NO_ADS", "ZERO_FEE_MARKET", "ALL_CHARS"]),
    popular: false,
    isGratis: false,
  }),
]);
const obterTodosOsPlanos = () => planosGames;
const obterPlanoPorId = (id) => planosGames.find((p) => p.id === id);
const obterPlanoPorNome = (nome) => planosGames.find((p) => p.nome === nome);
module.exports = { obterTodosOsPlanos, obterPlanoPorId, obterPlanoPorNome };
