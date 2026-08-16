
const planosGames = Object.freeze([
  Object.freeze({
    id: 'gratis',
    nome: 'Passe Amador',
    precoMensal: 0,
    precoAnual: 0,
    tokens: 100,
    recursos: ['100 Tokens Iniciais', 'Acesso Básico', '1 Uniforme Padrão'],
    popular: false,
    isGratis: true
  }),
  Object.freeze({
    id: 'premium',
    nome: 'Passe Profissional',
    precoMensal: 49.90,
    precoAnual: 499.90,
    tokens: 5000,
    recursos: ['5.000 Tokens/mês', 'Conjuntos de Personagens Épicos', 'Acesso a Ligas Exclusivas'],
    popular: true,
    isGratis: false
  }),
  Object.freeze({
    id: 'vip',
    nome: 'Sócio Lenda',
    precoMensal: 99.90,
    precoAnual: 999.90,
    tokens: 15000,
    recursos: ['Tokens Ilimitados', 'Todos os Personagens Desbloqueados', 'Sem Anúncios'],
    popular: false,
    isGratis: false
  })
]);

const obterTodosOsPlanos = () => planosGames;

const obterPlanoPorId = (id) => planosGames.find(p => p.id === id);

const obterPlanoPorNome = (nome) => planosGames.find(p => p.nome === nome);

module.exports = { obterTodosOsPlanos, obterPlanoPorId, obterPlanoPorNome };
