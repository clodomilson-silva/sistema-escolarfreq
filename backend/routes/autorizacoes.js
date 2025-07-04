const express = require('express');
const router = express.Router();

// Placeholder básico para autorizações
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Endpoint de autorizações em desenvolvimento'
  });
});

router.post('/', async (req, res) => {
  res.status(201).json({
    success: true,
    data: { id: 'temp-id', ...req.body },
    message: 'Autorização criada (placeholder)'
  });
});

router.get('/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, placeholder: true },
    message: 'Autorização encontrada (placeholder)'
  });
});

router.put('/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body },
    message: 'Autorização atualizada (placeholder)'
  });
});

router.delete('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'Autorização excluída (placeholder)'
  });
});

module.exports = router;
