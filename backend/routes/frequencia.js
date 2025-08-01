const express = require('express');
const router = express.Router();
const frequenciaService = require('../services/frequenciaService');
const { frequenciaSchema, frequenciaUpdateSchema } = require('../validators/frequenciaValidator');

// Listar frequências por turma e data
router.get('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ 
        error: 'Data é obrigatória',
        message: 'Forneça a data no formato YYYY-MM-DD' 
      });
    }

    const frequencias = await frequenciaService.buscarPorTurmaEData(turmaId, data);
    res.json(frequencias);
  } catch (error) {
    console.error('Erro ao buscar frequências:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Listar frequências por aluno
router.get('/aluno/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const filtros = req.query;

    const frequencias = await frequenciaService.buscarPorAluno(alunoId, filtros);
    res.json(frequencias);
  } catch (error) {
    console.error('Erro ao buscar frequências do aluno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Obter estatísticas de frequência de um aluno
router.get('/estatisticas/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { turma_id } = req.query;

    const estatisticas = await frequenciaService.obterEstatisticasAluno(alunoId, turma_id);
    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Buscar frequência por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const frequencia = await frequenciaService.buscarPorId(id);
    
    if (!frequencia) {
      return res.status(404).json({ 
        error: 'Frequência não encontrada' 
      });
    }

    res.json(frequencia);
  } catch (error) {
    console.error('Erro ao buscar frequência:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Registrar frequência individual
router.post('/', async (req, res) => {
  try {
    const { error, value } = frequenciaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }

    // Verificar se já existe frequência para este aluno nesta data
    const jaExiste = await frequenciaService.verificarFrequenciaExiste(
      value.aluno_id, 
      value.turma_id, 
      value.data
    );

    if (jaExiste) {
      return res.status(409).json({
        error: 'Frequência já registrada',
        message: 'Já existe registro de frequência para este aluno nesta data'
      });
    }

    const id = await frequenciaService.registrarPresenca(value);
    const frequencia = await frequenciaService.buscarPorId(id);
    
    res.status(201).json({
      message: 'Frequência registrada com sucesso',
      data: frequencia
    });
  } catch (error) {
    console.error('Erro ao registrar frequência:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Registrar frequência em lote para uma turma
router.post('/lote', async (req, res) => {
  try {
    const { turma_id, data, frequencias } = req.body;

    if (!turma_id || !data || !Array.isArray(frequencias)) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'turma_id, data e array de frequencias são obrigatórios'
      });
    }

    // Validar cada frequência no array
    for (const freq of frequencias) {
      if (!freq.aluno_id || typeof freq.presente !== 'boolean') {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Cada frequência deve ter aluno_id e presente (boolean)'
        });
      }
    }

    await frequenciaService.registrarFrequenciaLote(turma_id, data, frequencias);
    
    res.status(201).json({
      message: 'Frequências registradas com sucesso',
      total: frequencias.length
    });
  } catch (error) {
    console.error('Erro ao registrar frequências em lote:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Atualizar frequência
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = frequenciaUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }

    const frequenciaExiste = await frequenciaService.buscarPorId(id);
    if (!frequenciaExiste) {
      return res.status(404).json({ 
        error: 'Frequência não encontrada' 
      });
    }

    await frequenciaService.atualizar(id, value);
    const frequenciaAtualizada = await frequenciaService.buscarPorId(id);
    
    res.json({
      message: 'Frequência atualizada com sucesso',
      data: frequenciaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar frequência:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Deletar frequência
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const frequenciaExiste = await frequenciaService.buscarPorId(id);
    if (!frequenciaExiste) {
      return res.status(404).json({ 
        error: 'Frequência não encontrada' 
      });
    }

    await frequenciaService.deletar(id);
    
    res.json({ 
      message: 'Frequência deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar frequência:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = router;
