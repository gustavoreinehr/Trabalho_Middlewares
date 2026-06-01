const db = require('../configs')

async function getFaturas () {
  const resposta = await db.query('select * from faturas')
  return resposta.rows
}

async function getFaturasByUserId (usuario_id) {
  const resposta = await db.query('select * from faturas where usuario_id = $1', [usuario_id])
  return resposta.rows
}

async function getFaturaById (id) {
  const resposta = await db.query('select * from faturas where id = $1', [id])
  return resposta.rows[0]
}

async function createFatura (params) {
  const { venda_id, usuario_id, valor_fatura, status, data_vencimento, data_pagamento } = params
  const sql = `
    insert into faturas (
      venda_id,
      usuario_id,
      valor_fatura,
      status,
      data_vencimento,
      data_pagamento
    ) values (
      $1,
      $2,
      $3,
      coalesce($4, 'pendente'::status_fatura),
      $5,
      $6
    ) returning id, venda_id, usuario_id, valor_fatura, status, data_vencimento, data_pagamento, criado_em
  `
  const resposta = await db.query(sql, [
    venda_id,
    usuario_id,
    valor_fatura,
    status,
    data_vencimento,
    data_pagamento
  ])
  return resposta.rows
}

async function updateFatura (params) {
  const campos = []
  const binds = []
  let bindIndex = 1

  if (Object.hasOwn(params, 'status')) {
    campos.push(` status = $${bindIndex++} `)
    binds.push(params.status)
  }

  if (Object.hasOwn(params, 'data_pagamento')) {
    campos.push(` data_pagamento = $${bindIndex++} `)
    binds.push(params.data_pagamento)
  }

  if (campos.length === 0) {
    throw new Error('Nenhum campo para atualizar')
  }

  binds.push(params.id)
  const sql = `
    update faturas
       set ${campos.join(',')}
     where id = $${bindIndex++}
     returning *
  `

  const resposta = await db.query(sql, binds)
  return resposta.rows
}

async function deleteFatura (params) {
  const sql = 'delete from faturas where id = $1'
  const resposta = await db.query(sql, [params.id])
  return resposta.rowCount
}

module.exports = {
  getFaturas,
  getFaturasByUserId,
  getFaturaById,
  createFatura,
  updateFatura,
  deleteFatura
}