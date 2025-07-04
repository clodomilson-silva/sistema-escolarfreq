const Joi = require('joi');

const frequenciaSchema = Joi.object({
  aluno_id: Joi.string().required().messages({
    'string.empty': 'ID do aluno é obrigatório',
    'any.required': 'ID do aluno é obrigatório'
  }),
  turma_id: Joi.string().required().messages({
    'string.empty': 'ID da turma é obrigatório',
    'any.required': 'ID da turma é obrigatório'
  }),
  data: Joi.date().max('now').required().messages({
    'date.base': 'Data deve ser uma data válida',
    'date.max': 'Data não pode ser no futuro',
    'any.required': 'Data é obrigatória'
  }),
  presente: Joi.boolean().required().messages({
    'boolean.base': 'Presente deve ser verdadeiro ou falso',
    'any.required': 'Status de presença é obrigatório'
  }),
  observacoes: Joi.string().max(200).optional().messages({
    'string.max': 'Observações devem ter no máximo 200 caracteres'
  }),
  justificativa: Joi.string().max(300).when('presente', {
    is: false,
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }).messages({
    'string.max': 'Justificativa deve ter no máximo 300 caracteres',
    'any.unknown': 'Justificativa só é permitida quando o aluno está ausente'
  })
});

const frequenciaUpdateSchema = frequenciaSchema.fork(['aluno_id', 'turma_id', 'data'], (schema) => schema.optional());

module.exports = {
  frequenciaSchema,
  frequenciaUpdateSchema
};
