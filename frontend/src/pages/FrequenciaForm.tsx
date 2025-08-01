import React, { useState, useEffect, useCallback } from 'react';
import { frequenciaAPI, FrequenciaLote } from '../services/api';
import './FrequenciaForm.css';

interface Aluno {
  id: string;
  nome: string;
  ra: string;
}

interface FrequenciaFormProps {
  turmaId: string;
  alunos: Aluno[];
  onClose: () => void;
}

const FrequenciaForm: React.FC<FrequenciaFormProps> = ({ turmaId, alunos, onClose }) => {
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

      // Atualizar estado com frequências existentes - usar função callback para evitar dependência
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

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente,
        // Limpar justificativa se marcou como presente
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
    const frequenciasAtualizadas = { ...frequencias };
    Object.keys(frequenciasAtualizadas).forEach(alunoId => {
      frequenciasAtualizadas[alunoId] = {
        ...frequenciasAtualizadas[alunoId],
        presente: true,
        justificativa: ''
      };
    });
    setFrequencias(frequenciasAtualizadas);
  };

  const marcarTodosFaltosos = () => {
    const frequenciasAtualizadas = { ...frequencias };
    Object.keys(frequenciasAtualizadas).forEach(alunoId => {
      frequenciasAtualizadas[alunoId] = {
        ...frequenciasAtualizadas[alunoId],
        presente: false
      };
    });
    setFrequencias(frequenciasAtualizadas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const frequenciasArray = Object.values(frequencias);
      await frequenciaAPI.registrarLote(turmaId, dataFrequencia, frequenciasArray);
      
      setSuccess(`Frequência registrada com sucesso para ${frequenciasArray.length} alunos!`);
      
      // Fechar modal após um tempo
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      console.error('Erro ao salvar frequência:', error);
      setError('Erro ao salvar frequência');
    } finally {
      setSaving(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const contarPresencas = () => {
    return Object.values(frequencias).filter(f => f.presente).length;
  };

  const contarFaltas = () => {
    return Object.values(frequencias).filter(f => !f.presente).length;
  };

  if (loading) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2">Carregando frequências...</p>
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
              onClick={onClose}
              disabled={saving}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {/* Controles da data e ações em lote */}
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
                  />
                </div>
                <div className="col-md-8 d-flex align-items-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={marcarTodosPresentes}
                  >
                    <i className="bi bi-check-all me-1"></i>
                    Marcar Todos Presentes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm"
                    onClick={marcarTodosFaltosos}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Marcar Todos Faltosos
                  </button>
                </div>
              </div>

              {/* Resumo */}
              <div className="row mb-3">
                <div className="col-12">
                  <div className="card bg-light">
                    <div className="card-body py-2">
                      <div className="row text-center">
                        <div className="col-md-3">
                          <strong>Data:</strong> {formatarData(dataFrequencia)}
                        </div>
                        <div className="col-md-3">
                          <strong>Total:</strong> {alunos.length} alunos
                        </div>
                        <div className="col-md-3">
                          <span className="text-success">
                            <strong>Presentes:</strong> {contarPresencas()}
                          </span>
                        </div>
                        <div className="col-md-3">
                          <span className="text-warning">
                            <strong>Faltas:</strong> {contarFaltas()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de alunos */}
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
                                className="form-check-input"
                                type="radio"
                                name={`presenca-${aluno.id}`}
                                id={`presente-${aluno.id}`}
                                checked={freq.presente}
                                onChange={() => handlePresencaChange(aluno.id, true)}
                              />
                              <label className="form-check-label text-success" htmlFor={`presente-${aluno.id}`}>
                                <i className="bi bi-check-circle me-1"></i>
                                Presente
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`presenca-${aluno.id}`}
                                id={`falta-${aluno.id}`}
                                checked={!freq.presente}
                                onChange={() => handlePresencaChange(aluno.id, false)}
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
                              disabled={freq.presente}
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

export default FrequenciaForm;
