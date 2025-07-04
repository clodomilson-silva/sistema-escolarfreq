const express = require('express');
const router = express.Router();

// Placeholder básico para frequência
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Endpoint de frequência em desenvolvimento'
  });
});

router.post('/', async (req, res) => {
  res.status(201).json({
    success: true,
    data: { id: 'temp-id', ...req.body },
    message: 'Frequência registrada (placeholder)'
  });
});

router.get('/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, placeholder: true },
    message: 'Frequência encontrada (placeholder)'
  });
});

router.put('/:id', async (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body },
    message: 'Frequência atualizada (placeholder)'
  });
});

router.delete('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'Frequência excluída (placeholder)'
  });
});

module.exports = router;
