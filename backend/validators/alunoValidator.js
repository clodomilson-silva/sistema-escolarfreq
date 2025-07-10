const Joi = require('joi');

const alunoSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  matricula: Joi.string().min(6).max(20).required().messages({
    'string.empty': 'Matrícula é obrigatória',
    'string.min': 'Matrícula deve ter pelo menos 6 caracteres',
    'string.max': 'Matrícula deve ter no máximo 20 caracteres'
  }),
  data_nascimento: Joi.date().max('now').required().messages({
    'date.base': 'Data de nascimento deve ser uma data válida',
    'date.max': 'Data de nascimento não pode ser no futuro',
    'any.required': 'Data de nascimento é obrigatória'
  }),
  email: Joi.string().email().max(100).required().messages({
    'string.email': 'Email deve ter um formato válido',
    'string.max': 'Email deve ter no máximo 100 caracteres',
    'any.required': 'Email é obrigatório'
  })
});

const alunoUpdateSchema = alunoSchema.fork(['matricula'], (schema) => schema.optional());

module.exports = {
  alunoSchema,
  alunoUpdateSchema
};
