const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro do Firebase
  if (err.code && err.code.startsWith('firestore/')) {
    return res.status(500).json({
      error: 'Erro no banco de dados',
      message: 'Erro interno do servidor'
    });
  }

  // Erro customizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'Erro interno do servidor'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};

module.exports = errorHandler;
