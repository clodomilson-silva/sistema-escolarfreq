const express = require('express');
const router = express.Router();
const turmaService = require('../services/turmaService');
const { turmaSchema, turmaUpdateSchema } = require('../validators/turmaValidator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar middleware de autenticação para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

const validarTurma = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

// GET /api/turmas - Listar todas as turmas
router.get('/', async (req, res, next) => {
  try {
    const { ano, turno } = req.query;
    const filtros = {};
    
    if (ano) filtros.ano = ano;
    if (turno) filtros.turno = turno;
    
    const turmas = await turmaService.listarTurmas(filtros);
    
    res.json({
      success: true,
      data: turmas,
      total: turmas.length,
      message: `${turmas.length} turma(s) encontrada(s)`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/turmas/:id - Obter turma por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const turma = await turmaService.obterTurmaPorId(id);
    
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: turma,
      message: 'Turma encontrada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/turmas - Criar nova turma
router.post('/', validarTurma(turmaSchema), async (req, res, next) => {
  try {
    const turma = await turmaService.criarTurma(req.body);
    
    res.status(201).json({
      success: true,
      data: turma,
      message: 'Turma criada com sucesso'
    });
  } catch (error) {
    if (error.message.includes('já existe')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// PUT /api/turmas/:id - Atualizar turma
router.put('/:id', validarTurma(turmaUpdateSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const turma = await turmaService.atualizarTurma(id, req.body);
    
    res.json({
      success: true,
      data: turma,
      message: 'Turma atualizada com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.statusCode = 404;
    } else if (error.message.includes('já existe')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// DELETE /api/turmas/:id - Excluir turma
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await turmaService.excluirTurma(id);
    
    res.json({
      success: true,
      message: 'Turma excluída com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.statusCode = 404;
    }
    next(error);
  }
});

// POST /api/turmas/:id/alunos/:alunoId - Adicionar aluno à turma
router.post('/:id/alunos/:alunoId', async (req, res, next) => {
  try {
    const { id, alunoId } = req.params;
    const turma = await turmaService.adicionarAluno(id, alunoId);
    
    res.json({
      success: true,
      data: turma,
      message: 'Aluno adicionado à turma com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.statusCode = 404;
    } else if (error.message.includes('já está')) {
      error.statusCode = 400;
    }
    next(error);
  }
});

// DELETE /api/turmas/:id/alunos/:alunoId - Remover aluno da turma
router.delete('/:id/alunos/:alunoId', async (req, res, next) => {
  try {
    const { id, alunoId } = req.params;
    const turma = await turmaService.removerAluno(id, alunoId);
    
    res.json({
      success: true,
      data: turma,
      message: 'Aluno removido da turma com sucesso'
    });
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.statusCode = 404;
    }
    next(error);
  }
});

module.exports = router;
