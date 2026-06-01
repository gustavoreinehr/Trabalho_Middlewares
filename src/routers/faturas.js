const controller = require('../controllers/faturas')
const { verifyJWT } = require('../middlewares/auth')
const { verifyAdmin } = require('../middlewares/admin')

module.exports = (app) => {
  app.get('/faturas', verifyJWT, controller.getFaturas)
  app.post('/faturas', verifyJWT, controller.createFatura)
  app.patch('/faturas/:id', verifyJWT, controller.updateFatura)
  app.delete('/faturas/:id', verifyJWT, verifyAdmin, controller.deleteFatura)
}