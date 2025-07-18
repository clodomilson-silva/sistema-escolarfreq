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
  })
});

const turmaUpdateSchema = turmaSchema.fork(['nome', 'ano', 'turno'], (schema) => schema.optional());

module.exports = {
  turmaSchema,
  turmaUpdateSchema
};
