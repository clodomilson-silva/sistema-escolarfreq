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
  }),
  telefone: Joi.string().pattern(/^[\d\s\-\(\)\+]+$/).min(10).max(20).optional().messages({
    'string.pattern.base': 'Telefone deve conter apenas números, espaços, parênteses, hífen ou sinal de mais',
    'string.min': 'Telefone deve ter pelo menos 10 caracteres',
    'string.max': 'Telefone deve ter no máximo 20 caracteres'
  }),
  endereco: Joi.object({
    rua: Joi.string().max(200).optional(),
    numero: Joi.string().max(10).optional(),
    bairro: Joi.string().max(100).optional(),
    cidade: Joi.string().max(100).optional(),
    cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional().messages({
      'string.pattern.base': 'CEP deve estar no formato 00000-000'
    }),
    estado: Joi.string().length(2).uppercase().optional()
  }).optional()
});

const alunoUpdateSchema = alunoSchema.fork(['matricula'], (schema) => schema.optional());

module.exports = {
  alunoSchema,
  alunoUpdateSchema
};
