const service = require('../services/vendas')

async function getVendas (req, res) {
  try {
    const vendas = await service.getVendas()
    return res.status(200).json({
      status: 'ok',
      data: vendas
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function createVenda (req, res) {
  try {
    if (!Object.hasOwn(req.body, 'total_venda')) {
      return res.status(400).json({
        status: 'error',
        message: 'Campo obrigatorio faltando: total_venda'
      })
    }

    if (typeof req.body.total_venda !== 'number' || Number.isNaN(req.body.total_venda) || req.body.total_venda <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'O campo total_venda deve ser numero real maior que zero'
      })
    }

    req.body.usuario_id = req.user.user.id
    const venda = await service.createVenda(req.body)
    return res.status(201).json({
      status: 'ok',
      message: 'Venda cadastrada com sucesso',
      data: venda
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function updateVenda (req, res) {
  try {
    const dadosAtualizacao = {
      ...req.body,
      id: req.params.id
    }

    if (Object.hasOwn(dadosAtualizacao, 'total_venda')) {
      if (typeof dadosAtualizacao.total_venda !== 'number' || Number.isNaN(dadosAtualizacao.total_venda) || dadosAtualizacao.total_venda <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'O campo total_venda deve ser numero real maior que zero'
        })
      }
    }

    const venda = await service.updateVenda(dadosAtualizacao)

    if (venda.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Venda nao encontrada, id invalido'
      })
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Venda atualizada com sucesso',
      data: venda
    })
  } catch (error) {
    if (error.message === 'Nenhum campo para atualizar') {
      return res.status(400).json({
        status: 'error',
        message: 'Nenhum campo valido enviado para atualizacao'
      })
    }

    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function deleteVenda (req, res) {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        status: 'error',
        message: 'O campo id e obrigatorio'
      })
    }

    const linhasAfetadas = await service.deleteVenda(req.params)

    if (linhasAfetadas === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Venda nao encontrada, id invalido'
      })
    }

    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

module.exports = {
  getVendas,
  createVenda,
  updateVenda,
  deleteVenda
}
