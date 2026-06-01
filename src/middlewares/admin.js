function verifyAdmin(req, res, next) {
  if (req.user.user.tipo_acesso !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Apenas administradores podem executar esta ação'
    })
  }

  next()
}

module.exports = {
  verifyAdmin
}

