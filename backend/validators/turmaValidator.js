const Joi = require('joi');

const turmaSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome da turma é obrigatório',
    'string.min': 'Nome da turma deve ter pelo menos 2 caracteres',
    'string.max': 'Nome da turma deve ter no máximo 100 caracteres'
  }),
  ano: Joi.string().min(1).max(20).required().messages({
    'string.empty': 'Número da turma é obrigatório',
    'string.min': 'Número da turma deve ter pelo menos 1 caractere',
    'string.max': 'Número da turma deve ter no máximo 20 caracteres',
    'any.required': 'Número da turma é obrigatório'
  }),
  turno: Joi.string().valid('matutino', 'vespertino', 'noturno', 'integral').required().messages({
    'any.only': 'Turno deve ser: matutino, vespertino, noturno ou integral',
    'any.required': 'Turno é obrigatório'
  }),
  tipo: Joi.string().valid('base', 'disciplina').optional().default('base').messages({
    'any.only': 'Tipo deve ser: base ou disciplina'
  }),
  turma_base_id: Joi.string().optional().messages({
    'string.base': 'ID da turma base deve ser uma string'
  }),
  disciplina: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome da disciplina deve ter pelo menos 2 caracteres',
    'string.max': 'Nome da disciplina deve ter no máximo 100 caracteres'
  }),
  professor_id: Joi.string().optional().messages({
    'string.base': 'ID do professor deve ser uma string'
  }),
  professor_nome: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome do professor deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do professor deve ter no máximo 100 caracteres'
  }),
  carga_horaria: Joi.number().integer().min(1).max(1000).optional().messages({
    'number.base': 'Carga horária deve ser um número',
    'number.integer': 'Carga horária deve ser um número inteiro',
    'number.min': 'Carga horária deve ser pelo menos 1',
    'number.max': 'Carga horária deve ser no máximo 1000'
  }),
  descricao: Joi.string().max(500).optional().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres'
  }),
  professor_responsavel: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nome do professor deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do professor deve ter no máximo 100 caracteres'
  }),
  capacidade_maxima: Joi.number().integer().min(1).max(50).optional().messages({
    'number.base': 'Capacidade máxima deve ser um número',
    'number.integer': 'Capacidade máxima deve ser um número inteiro',
    'number.min': 'Capacidade máxima deve ser pelo menos 1',
    'number.max': 'Capacidade máxima deve ser no máximo 50'
  }),
  alunos: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Alunos deve ser uma lista de IDs'
  }),
  status: Joi.string().valid('ativa', 'inativa', 'concluida').optional().default('ativa').messages({
    'any.only': 'Status deve ser: ativa, inativa ou concluida'
  })
});

const turmaUpdateSchema = turmaSchema.fork(['nome', 'ano', 'turno'], (schema) => schema.optional());

module.exports = {
  turmaSchema,
  turmaUpdateSchema
};
