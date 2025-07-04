const Joi = require('joi');

const autorizacaoSchema = Joi.object({
  aluno_id: Joi.string().required().messages({
    'string.empty': 'ID do aluno é obrigatório',
    'any.required': 'ID do aluno é obrigatório'
  }),
  responsavel_nome: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome do responsável é obrigatório',
    'string.min': 'Nome do responsável deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do responsável deve ter no máximo 100 caracteres'
  }),
  responsavel_telefone: Joi.string().pattern(/^[\d\s\-\(\)\+]+$/).min(10).max(20).required().messages({
    'string.pattern.base': 'Telefone deve conter apenas números, espaços, parênteses, hífen ou sinal de mais',
    'string.min': 'Telefone deve ter pelo menos 10 caracteres',
    'string.max': 'Telefone deve ter no máximo 20 caracteres',
    'any.required': 'Telefone do responsável é obrigatório'
  }),
  tipo: Joi.string().valid('saida_antecipada', 'medicamento', 'atividade_extra', 'outros').required().messages({
    'any.only': 'Tipo deve ser: saida_antecipada, medicamento, atividade_extra ou outros',
    'any.required': 'Tipo de autorização é obrigatório'
  }),
  descricao: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Descrição é obrigatória',
    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    'string.max': 'Descrição deve ter no máximo 500 caracteres'
  }),
  data_inicio: Joi.date().min('now').required().messages({
    'date.base': 'Data de início deve ser uma data válida',
    'date.min': 'Data de início não pode ser no passado',
    'any.required': 'Data de início é obrigatória'
  }),
  data_fim: Joi.date().min(Joi.ref('data_inicio')).optional().messages({
    'date.base': 'Data de fim deve ser uma data válida',
    'date.min': 'Data de fim deve ser posterior à data de início'
  }),
  observacoes: Joi.string().max(300).optional().messages({
    'string.max': 'Observações devem ter no máximo 300 caracteres'
  })
});

const autorizacaoUpdateSchema = autorizacaoSchema.fork(['aluno_id', 'responsavel_nome', 'responsavel_telefone', 'tipo', 'descricao', 'data_inicio'], (schema) => schema.optional());

module.exports = {
  autorizacaoSchema,
  autorizacaoUpdateSchema
};
