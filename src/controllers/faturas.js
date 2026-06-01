const service = require('../services/faturas')
const vendasService = require('../services/vendas')

async function getFaturas (req, res) {
  try {
    if (req.user.user.tipo_acesso === 'admin') {
      const faturas = await service.getFaturas()
      return res.status(200).json({
        status: 'ok',
        data: faturas
      })
    }

    if (req.user.user.tipo_acesso === 'padrao') {
      const faturas = await service.getFaturasByUserId(req.user.user.id)
      return res.status(200).json({
        status: 'ok',
        data: faturas
      })
    }

    const faturas = await service.getFaturas()
    return res.status(200).json({
      status: 'ok',
      data: faturas
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function createFatura (req, res) {
  try {
    let camposFaltando = ''
    if (!req.body || !Object.hasOwn(req.body, 'venda_id') || req.body.venda_id === null || req.body.venda_id === '') camposFaltando += 'venda_id, '
    if (!req.body || !Object.hasOwn(req.body, 'valor_fatura') || req.body.valor_fatura === null || req.body.valor_fatura === '') camposFaltando += 'valor_fatura, '
    if (!req.body || !Object.hasOwn(req.body, 'data_vencimento') || req.body.data_vencimento === null || req.body.data_vencimento === '') camposFaltando += 'data_vencimento, '

    if (camposFaltando !== '') {
      return res.status(400).json({
        status: 'error',
        message: 'Campos obrigatorios faltando: ' + camposFaltando.slice(0, -2)
      })
    }

    if (typeof req.body.valor_fatura !== 'number' || Number.isNaN(req.body.valor_fatura) || req.body.valor_fatura <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'O campo valor_fatura deve ser numero real maior que zero'
      })
    }

    const dataConvertida = new Date(req.body.data_vencimento)
    if (Number.isNaN(dataConvertida.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Campo data_vencimento invalido'
      })
    }

    const dataAtualBrasilia = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const dataVencimentoStr = dataConvertida.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

    if (dataVencimentoStr < dataAtualBrasilia) {
      return res.status(400).json({
        status: 'error',
        message: 'A data de vencimento nao pode ser menor que data atual'
      })
    }

    const venda = await vendasService.getVendaById(req.body.venda_id)
    if (!venda) {
      return res.status(404).json({
        status: 'error',
        message: 'Venda nao encontrada'
      })
    }

    if (Number(venda.total_venda) !== Number(req.body.valor_fatura)) {
      return res.status(400).json({
        status: 'error',
        message: 'O valor da fatura deve ser exatamente igual ao total da venda'
      })
    }

    req.body.usuario_id = req.user.user.id
    const fatura = await service.createFatura(req.body)
    return res.status(201).json({
      status: 'ok',
      message: 'Fatura cadastrada com sucesso',
      data: fatura
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}

async function updateFatura (req, res) {
  try {
    const dadosAtualizacao = {
      ...req.body,
      id: req.params.id
    }

    const faturaExistente = await service.getFaturaById(dadosAtualizacao.id)
    if (!faturaExistente) {
      return res.status(404).json({
        status: 'error',
        message: 'Fatura nao encontrada, id invalido'
      })
    }

    if (faturaExistente.status === 'pago') {
      return res.status(400).json({
        status: 'error',
        message: 'Fatura paga nao pode ser alterada'
      })
    }

    if (dadosAtualizacao.status === 'pendente' || dadosAtualizacao.status === 'cancelado') {
      dadosAtualizacao.data_pagamento = null
    }

    if (dadosAtualizacao.status === 'pago' && !dadosAtualizacao.data_pagamento) {
      dadosAtualizacao.data_pagamento = new Date().toISOString()
    }

    const fatura = await service.updateFatura(dadosAtualizacao)

    return res.status(200).json({
      status: 'ok',
      message: 'Fatura atualizada com sucesso',
      data: fatura
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

async function deleteFatura (req, res) {
  try {
    const linhasAfetadas = await service.deleteFatura(req.params)

    if (linhasAfetadas === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Fatura nao encontrada, id invalido'
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
  getFaturas,
  createFatura,
  updateFatura,
  deleteFatura
}
