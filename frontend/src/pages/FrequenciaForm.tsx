import React, { useState, useEffect, useCallback } from 'react';
import { frequenciaAPI, FrequenciaLote } from '../services/api';
import './FrequenciaForm.css';
import { AxiosError } from 'axios';

interface Aluno {
  id: string;
  nome: string;
  ra: string;
}

interface FrequenciaFormProps {
  turmaId: string;
  alunos: Aluno[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const FrequenciaForm: React.FC<FrequenciaFormProps> = ({ turmaId, alunos, onClose, onSuccess }) => {
  const [dataFrequencia, setDataFrequencia] = useState<string>(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });
  const [frequencias, setFrequencias] = useState<{ [key: string]: FrequenciaLote }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Inicializar frequências quando alunos ou data mudam
  useEffect(() => {
    const initFrequencias: { [key: string]: FrequenciaLote } = {};
    alunos.forEach(aluno => {
      initFrequencias[aluno.id] = {
        aluno_id: aluno.id,
        presente: true,
        observacoes: '',
        justificativa: ''
      };
    });
    setFrequencias(initFrequencias);
  }, [alunos]);

  // Carregar frequências existentes quando a data muda
  const carregarFrequenciasExistentes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await frequenciaAPI.buscarPorTurmaEData(turmaId, dataFrequencia);
      const existentes = response.data;

      setFrequencias(prev => {
        const frequenciasAtualizadas = { ...prev };
        existentes.forEach(freq => {
          if (frequenciasAtualizadas[freq.aluno_id]) {
            frequenciasAtualizadas[freq.aluno_id] = {
              aluno_id: freq.aluno_id,
              presente: freq.presente,
              observacoes: freq.observacoes || '',
              justificativa: freq.justificativa || ''
            };
          }
        });
        return frequenciasAtualizadas;
      });
    } catch (error) {
      console.error('Erro ao carregar frequências existentes:', error);
    } finally {
      setLoading(false);
    }
  }, [turmaId, dataFrequencia]);

  useEffect(() => {
    if (dataFrequencia && turmaId) {
      carregarFrequenciasExistentes();
    }
  }, [dataFrequencia, turmaId, carregarFrequenciasExistentes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const frequenciasArray = Object.values(frequencias);
      
      await frequenciaAPI.registrarLote(turmaId, dataFrequencia, frequenciasArray);
      
      setSuccess(`✅ Frequência registrada com sucesso para ${frequenciasArray.length} alunos!`);
      
      // Aguardar brevemente para mostrar a mensagem
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Notificar sucesso e fechar
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
      let mensagemErro = 'Erro ao salvar frequência';
      
      if (error instanceof Error) {
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;
        if (axiosError.response?.status === 409) {
          mensagemErro = 'Já existe frequência registrada para esta turma nesta data.';
        } else if (axiosError.response?.data?.message) {
          mensagemErro = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          mensagemErro = axiosError.response.data.error;
        } else if (axiosError.response?.status === 500) {
          mensagemErro = 'Erro interno do servidor. Por favor, tente novamente.';
        }
      }
      
      setError(mensagemErro);
      setSaving(false);
    }
  };

  // Funções de manipulação do formulário
  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente,
        justificativa: presente ? '' : prev[alunoId].justificativa
      }
    }));
  };

  const handleObservacoesChange = (alunoId: string, observacoes: string) => {
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        observacoes
      }
    }));
  };

  const handleJustificativaChange = (alunoId: string, justificativa: string) => {
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        justificativa
      }
    }));
  };

  const marcarTodosPresentes = () => {
    setFrequencias(prev => {
      const novasFrequencias = { ...prev };
      Object.keys(novasFrequencias).forEach(alunoId => {
        novasFrequencias[alunoId] = {
          ...novasFrequencias[alunoId],
          presente: true,
          justificativa: ''
        };
      });
      return novasFrequencias;
    });
  };

  const marcarTodosFaltosos = () => {
    setFrequencias(prev => {
      const novasFrequencias = { ...prev };
      Object.keys(novasFrequencias).forEach(alunoId => {
        novasFrequencias[alunoId] = {
          ...novasFrequencias[alunoId],
          presente: false
        };
      });
      return novasFrequencias;
    });
  };

  if (loading) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 mb-0">Carregando frequências...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-calendar-check me-2"></i>
              Registrar Frequência
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => !saving && onClose()}
              disabled={saving}
              aria-label="Fechar"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {/* Data e Ações em Lote */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Data da Frequência</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataFrequencia}
                    onChange={(e) => setDataFrequencia(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="col-md-8 d-flex align-items-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={marcarTodosPresentes}
                    disabled={saving}
                  >
                    <i className="bi bi-check-all me-1"></i>
                    Marcar Todos Presentes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm"
                    onClick={marcarTodosFaltosos}
                    disabled={saving}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Marcar Todos Faltosos
                  </button>
                </div>
              </div>

              {/* Lista de Alunos */}
              <div className="frequencia-list">
                {alunos.map(aluno => {
                  const freq = frequencias[aluno.id];
                  if (!freq) return null;

                  return (
                    <div key={aluno.id} className="card mb-2">
                      <div className="card-body py-2">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <strong>{aluno.nome}</strong>
                            <br />
                            <small className="text-muted">RA: {aluno.ra}</small>
                          </div>
                          
                          <div className="col-md-3">
                            <div className="form-check form-check-inline">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`presenca-${aluno.id}`}
                                id={`presente-${aluno.id}`}
                                checked={freq.presente}
                                onChange={() => handlePresencaChange(aluno.id, true)}
                                disabled={saving}
                              />
                              <label className="form-check-label text-success" htmlFor={`presente-${aluno.id}`}>
                                <i className="bi bi-check-circle me-1"></i>
                                Presente
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`presenca-${aluno.id}`}
                                id={`falta-${aluno.id}`}
                                checked={!freq.presente}
                                onChange={() => handlePresencaChange(aluno.id, false)}
                                disabled={saving}
                              />
                              <label className="form-check-label text-warning" htmlFor={`falta-${aluno.id}`}>
                                <i className="bi bi-x-circle me-1"></i>
                                Falta
                              </label>
                            </div>
                          </div>

                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Observações"
                              value={freq.observacoes}
                              onChange={(e) => handleObservacoesChange(aluno.id, e.target.value)}
                              disabled={saving}
                              maxLength={200}
                            />
                          </div>

                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Justificativa (apenas faltas)"
                              value={freq.justificativa}
                              onChange={(e) => handleJustificativaChange(aluno.id, e.target.value)}
                              disabled={freq.presente || saving}
                              maxLength={300}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {alunos.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-people display-4 text-muted"></i>
                  <p className="text-muted mt-2">Nenhum aluno matriculado nesta turma.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || alunos.length === 0}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Salvar Frequência
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};