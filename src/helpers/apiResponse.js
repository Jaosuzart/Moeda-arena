
const sucesso = (res, dados = null, status = 200) => {
  return res.status(status).json({
    sucesso: true,
    dados
  });
};

const erro = (res, mensagem, status = 500, codigo = 'ERRO_INTERNO') => {
  return res.status(status).json({
    sucesso: false,
    erro: mensagem,
    codigo
  });
};

module.exports = { sucesso, erro };
