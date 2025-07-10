const express = require('express');
const router = express.Router();
const alunoService = require('../services/alunoService');
const { alunoSchema, alunoUpdateSchema } = require('../validators/alunoValidator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware de validação
const validarAluno = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

// GET /api/alunos - Listar todos os alunos (protegido)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { nome, matricula } = req.query;
    const filtros = {};
    
    if (nome) filtros.nome = nome;
    if (matricula) filtros.matricula = matricula;
    
    const alunos = await alunoService.listarAlunos(filtros);
    
    res.json({
      success: true,
      data: alunos,
      total: alunos.length,
      message: `${alunos.length} aluno(s) encontrado(s)`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/alunos/count - Contar alunos (protegido)
router.get('/count', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const total = await alunoService.contarAlunos();
    
    res.json({
      success: true,
      data: { total },
      message: `Total de ${total} aluno(s) cadastrado(s)`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/alunos/:id - Obter aluno por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const aluno = await alunoService.obterAlunoPorId(id);
    
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: aluno,
      message: 'Aluno encontrado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/alunos/matricula/:matricula - Obter aluno por matrícula
router.get('/matricula/:matricula', async (req, res, next) => {
  try {
    const { matricula } = req.params;
    const aluno = await alunoService.obterAlunoPorMatricula(matricula);
    
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: aluno,
      message: 'Aluno encontrado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/alunos - Criar novo aluno (protegido)
router.post('/', authenticateToken, requireAdmin, validarAluno(alunoSchema), async (req, res, next) => {
  try {
    const aluno = await alunoService.criarAluno(req.body);
    
    res.status(201).json({
      success: true,
      data: aluno,
      message: 'Aluno criado com sucesso'
    });
  } catch (error) {
    if (error.message.includes('Matrícula já existe') || error.message.includes('Email já está em uso')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// PUT /api/alunos/:id - Atualizar aluno (protegido)
router.put('/:id', authenticateToken, requireAdmin, validarAluno(alunoUpdateSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const aluno = await alunoService.atualizarAluno(id, req.body);
    
    res.json({
      success: true,
      data: aluno,
      message: 'Aluno atualizado com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      error.statusCode = 404;
    } else if (error.message.includes('já existe') || error.message.includes('já está em uso')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// DELETE /api/alunos/:id - Excluir aluno (protegido)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await alunoService.excluirAluno(id);
    
    res.json({
      success: true,
      message: 'Aluno excluído com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      error.statusCode = 404;
    }
    next(error);
  }
});

module.exports = router;
