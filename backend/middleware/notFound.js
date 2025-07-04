const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`,
    availableRoutes: [
      'GET /health',
      'GET /api/alunos',
      'POST /api/alunos',
      'GET /api/alunos/:id',
      'PUT /api/alunos/:id',
      'DELETE /api/alunos/:id',
      'GET /api/turmas',
      'POST /api/turmas',
      'GET /api/turmas/:id',
      'PUT /api/turmas/:id',
      'DELETE /api/turmas/:id',
      'GET /api/autorizacoes',
      'POST /api/autorizacoes',
      'GET /api/autorizacoes/:id',
      'PUT /api/autorizacoes/:id',
      'DELETE /api/autorizacoes/:id',
      'GET /api/frequencia',
      'POST /api/frequencia',
      'GET /api/frequencia/:id',
      'PUT /api/frequencia/:id',
      'DELETE /api/frequencia/:id'
    ]
  });
};

module.exports = notFound;
