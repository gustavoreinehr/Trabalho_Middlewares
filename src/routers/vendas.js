const controller = require('../controllers/vendas')
const { verifyJWT } = require('../middlewares/auth')
const { verifyAdmin } = require('../middlewares/admin')

module.exports = (app) => {
  app.get('/vendas', verifyJWT, controller.getVendas)
  app.post('/vendas', verifyJWT, controller.createVenda)
  app.patch('/vendas/:id', verifyJWT, controller.updateVenda)
  app.delete('/vendas/:id', verifyJWT, verifyAdmin, controller.deleteVenda)
}