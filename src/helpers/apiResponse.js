/**
 * @module helpers/apiResponse
 * @description 


 * @param {import('express').Response} res
 * @param {*} dados 
 * @param {number} [status=200] 
 * @returns {import('express').Response}
 */
const sucesso = (res, dados = null, status = 200) => {
  return res.status(status).json({
    sucesso: true,
    dados
  });
};

/**
 * @param {import('express').Response} res 
 * @param {string} mensagem 
 * @param {number} [status=500] 
 * @param {string} [codigo='ERRO_INTERNO']
 * @returns {import('express').Response}
 */
const erro = (res, mensagem, status = 500, codigo = 'ERRO_INTERNO') => {
  return res.status(status).json({
    sucesso: false,
    erro: mensagem,
    codigo
  });
};

module.exports = { sucesso, erro };
