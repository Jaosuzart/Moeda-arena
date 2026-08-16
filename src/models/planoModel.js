
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
    id: 'iniciante',
    nome: 'Passe Iniciante',
    precoMensal: 4.99,
    precoAnual: 49.90,
    tokens: 1000,
    recursos: ['1.000 Tokens/mês', 'Acesso Básico Estendido', '1 Skin de Arma Comum'],
    popular: false,
    isGratis: false
  }),
  Object.freeze({
    id: 'premium',
    nome: 'Passe Profissional',
    precoMensal: 19.90,
    precoAnual: 199.00,
    tokens: 5000,
    recursos: ['5.000 Tokens/mês', 'Conjuntos de Personagens Épicos', 'Acesso a Ligas Exclusivas'],
    popular: true,
    isGratis: false
  }),
  Object.freeze({
    id: 'vip',
    nome: 'Sócio Lenda',
    precoMensal: 39.90,
    precoAnual: 399.00,
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
