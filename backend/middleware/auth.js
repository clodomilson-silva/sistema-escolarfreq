const authService = require('../services/authService');

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const decoded = authService.verificarToken(token);
    
    // Verificar se o admin ainda existe e está ativo
    const admin = await authService.obterAdminPorId(decoded.id);
    
    if (!admin || !admin.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar dados do admin na requisição
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso'
    });
  }  next();
};

// Middleware para verificar se é professor
const requireProfessor = (req, res, next) => {
  if (!req.admin || (req.admin.role !== 'professor' && req.admin.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas professores podem acessar este recurso'
    });
  }  next();
};

// Middleware opcional - não obrigatório ter token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verificarToken(token);
      const admin = await authService.obterAdminPorId(decoded.id);
      
      if (admin && admin.ativo) {
        req.admin = admin;
      }
    }
    
    next();
  } catch (error) {
    // Ignora erros de token para auth opcional
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireProfessor,
  optionalAuth
};
