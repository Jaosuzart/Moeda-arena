const planosGames = Object.freeze([
  Object.freeze({
    id: "gratis",
    nome: "Passe Amador",
    precoMensal: 0,
    precoAnual: 0,
    moedas: 100,
    recursos: ["100 Moedas Iniciais", "Acesso Básico", "1 Uniforme Padrão"],
    popular: false,
    isGratis: true,
  }),
  Object.freeze({
    id: "iniciante",
    nome: "Passe Iniciante",
    precoMensal: 4.99,
    precoAnual: 49.9,
    moedas: 1000,
    recursos: [
      "1.000 Moedas/mês",
      "Acesso Básico Estendido",
      "1 Skin de Arma Comum",
    ],
    popular: false,
    isGratis: false,
  }),
  Object.freeze({
    id: "premium",
    nome: "Passe Profissional",
    precoMensal: 19.9,
    precoAnual: 199.0,
    moedas: 5000,
    recursos: [
      "5.000 Moedas/mês",
      "Conjuntos de Personagens Épicos",
      "Acesso a Ligas Exclusivas",
    ],
    popular: true,
    isGratis: false,
  }),
  Object.freeze({
    id: "vip",
    nome: "Sócio Lenda",
    precoMensal: 39.9,
    precoAnual: 399.0,
    moedas: 15000,
    recursos: [
      "Moedas Ilimitados",
      "Todos os Personagens Desbloqueados",
      "Sem Anúncios",
    ],
    popular: false,
    isGratis: false,
  }),
]);
const obterTodosOsPlanos = () => planosGames;
const obterPlanoPorId = (id) => planosGames.find((p) => p.id === id);
const obterPlanoPorNome = (nome) => planosGames.find((p) => p.nome === nome);
module.exports = { obterTodosOsPlanos, obterPlanoPorId, obterPlanoPorNome };
