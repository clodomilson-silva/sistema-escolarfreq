const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { loginSchema, criarAdminSchema } = require('../validators/authValidator');

// Middleware de validação
const validar = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

// POST /auth/login - Login de administrador
router.post('/login', validar(loginSchema), async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    
    const resultado = await authService.login(email, senha);
    
    res.json({
      success: true,
      data: resultado,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    if (error.message.includes('Credenciais inválidas')) {
      error.statusCode = 401;
    }
    next(error);
  }
});

// POST /auth/register - Criar novo administrador (apenas admins podem criar outros admins)
router.post('/register', authenticateToken, requireAdmin, validar(criarAdminSchema), async (req, res, next) => {
  try {
    const administrador = await authService.criarAdministrador(req.body);
    
    res.status(201).json({
      success: true,
      data: administrador,
      message: 'Administrador criado com sucesso'
    });
  } catch (error) {
    if (error.message.includes('já está em uso')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// GET /auth/me - Obter dados do usuário logado
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
    message: 'Dados do usuário obtidos com sucesso'
  });
});

// POST /auth/logout - Logout (apenas informativo, JWT é stateless)
router.post('/logout', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// GET /auth/verify - Verificar se o token é válido
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      admin: req.admin
    },
    message: 'Token válido'
  });
});

// GET /auth/admins - Listar administradores (apenas admins)
router.get('/admins', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const administradores = await authService.listarAdministradores();
    
    res.json({
      success: true,
      data: administradores,
      total: administradores.length,
      message: `${administradores.length} administrador(es) encontrado(s)`
    });
  } catch (error) {
    next(error);
  }
});

// PUT /auth/admins/:id/desativar - Desativar administrador
router.put('/admins/:id/desativar', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Não permitir que o admin desative a si mesmo
    if (id === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    const resultado = await authService.desativarAdministrador(id);
    
    res.json({
      success: true,
      data: resultado,
      message: 'Administrador desativado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
