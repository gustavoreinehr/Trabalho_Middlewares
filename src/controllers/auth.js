const service = require('../services/auth')

async function register (req, res) {
  try {
    let camposFaltando = ''

    if (!req.body || !req.body.email) camposFaltando += 'email, '
    if (!req.body || !req.body.senha) camposFaltando += 'senha, '
    if (!req.body || !req.body.senha_confirm) camposFaltando += 'senha_confirm, '
    if (!req.body || !req.body.nome) camposFaltando += 'nome, '

    if (camposFaltando !== '') {
      return res.status(400).json({
        status: 'error',
        message: 'Campos obrigatorios faltando: ' + camposFaltando.slice(0, -2)
      })
    }

    const usuarioExistente = await service.getUserByEmail({ email: req.body.email })
    if (usuarioExistente.length) {
      return res.status(409).json({
        status: 'error',
        message: 'O email "' + req.body.email + '" ja esta em uso'
      })
    }

    if (req.body.senha !== req.body.senha_confirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Os campos senha e senha_confirm precisam ser iguais'
      })
    }

    if (req.body.senha.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'A senha deve ter ao menos 8 caracteres'
      })
    }

    const usuario = await service.register(req.body)
    return res.status(201).json({
      status: 'ok',
      message: 'Usuario registrado com sucesso!',
      data: usuario
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function login (req, res) {
  try {
    let camposFaltando = ''

    if (!req.body || !req.body.email) camposFaltando += 'email, '
    if (!req.body || !req.body.senha) camposFaltando += 'senha, '

    if (camposFaltando !== '') {
      return res.status(400).json({
        status: 'error',
        message: 'Campos obrigatorios faltando: ' + camposFaltando.slice(0, -2)
      })
    }

    const usuario = await service.login(req.body)
    return res.status(200).json(usuario)
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = {
  register,
  login
}
