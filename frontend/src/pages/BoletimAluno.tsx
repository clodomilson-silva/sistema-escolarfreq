import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import type { BoletimAluno, BoletimDisciplina } from '../types';
import './FormPages.css';

const BoletimAluno = () => {
  const { alunoId } = useParams<{ alunoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const turmaIdParam = searchParams.get('turma_id');
  const printParam = searchParams.get('print');
  
  const [boletim, setBoletim] = useState<BoletimAluno | null>(null);
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (alunoId) {
      fetchBoletim();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoId]);

  // Auto-imprimir quando print=true
  useEffect(() => {
    if (printParam === 'true' && boletim && !loading) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [printParam, boletim, loading]);

  const fetchBoletim = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = `/alunos/${alunoId}/boletim/`;
      const params: string[] = [];
      
      if (dataInicio) params.push(`data_inicio=${dataInicio}`);
      if (dataFim) params.push(`data_fim=${dataFim}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        let boletimData = response.data.data;
        
        // Se turma_id foi especificada, filtrar apenas essa turma
        if (turmaIdParam) {
          boletimData = {
            ...boletimData,
            disciplinas: boletimData.disciplinas.filter(
              (d: BoletimDisciplina) => d.turma_id === turmaIdParam
            )
          };
        }
        
        setBoletim(boletimData);
      }
    } catch (err) {
      console.error('Erro ao buscar boletim:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erro ao carregar boletim');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    fetchBoletim();
  };

  const handleImprimir = () => {
    window.print();
  };

  const calcularMediaGeral = () => {
    if (!boletim || boletim.disciplinas.length === 0) return 0;
    
    const somaMedias = boletim.disciplinas.reduce((acc, disc) => acc + disc.notas.media, 0);
    return (somaMedias / boletim.disciplinas.length).toFixed(2);
  };

  const calcularFrequenciaGeral = () => {
    if (!boletim || boletim.disciplinas.length === 0) return 0;
    
    const somaFreq = boletim.disciplinas.reduce((acc, disc) => acc + disc.frequencia.percentual_presenca, 0);
    return (somaFreq / boletim.disciplinas.length).toFixed(2);
  };

  const getStatusNota = (media: number) => {
    if (media >= 7) return { label: 'Aprovado', class: 'text-success' };
    if (media >= 5) return { label: 'Recuperação', class: 'text-warning' };
    return { label: 'Reprovado', class: 'text-danger' };
  };

  const getStatusFrequencia = (percentual: number) => {
    if (percentual >= 75) return { label: 'Adequada', class: 'text-success' };
    if (percentual >= 60) return { label: 'Atenção', class: 'text-warning' };
    return { label: 'Crítica', class: 'text-danger' };
  };

  return (
    <div className="container my-4 boletim-page">
      {/* Botão Voltar - Não imprime */}
      <div className="d-print-none mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/alunos')}
        >
          <i className="bi bi-arrow-left me-2"></i>Voltar para Lista de Alunos
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-print-none">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-file-earmark-text me-2"></i>
              Boletim Escolar
            </h4>
            <button
              className="btn btn-light btn-sm"
              onClick={handleImprimir}
              disabled={loading || !boletim}
            >
              <i className="bi bi-printer me-2"></i>
              Imprimir
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filtros - Não imprime */}
          <div className="row mb-4 d-print-none">
            <div className="col-md-4">
              <label htmlFor="dataInicio" className="form-label">
                <i className="bi bi-calendar-event me-2"></i>
                Data Início
              </label>
              <input
                type="date"
                id="dataInicio"
                className="form-control"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="dataFim" className="form-label">
                <i className="bi bi-calendar-event me-2"></i>
                Data Fim
              </label>
              <input
                type="date"
                id="dataFim"
                className="form-control"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={handleFiltrar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Carregando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-funnel me-2"></i>
                    Filtrar
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-print-none" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {!loading && boletim && (
            <>
              {/* Cabeçalho do Boletim - Imprime */}
              <div className="mb-4 p-4 border rounded d-print-block">
                <div className="text-center mb-4">
                  <h3 className="fw-bold">BOLETIM ESCOLAR</h3>
                  <p className="text-secondary mb-0">PontoClass</p>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Nome:</strong> {boletim.aluno.nome}
                    </p>
                    <p className="mb-2">
                      <strong>Matrícula:</strong> {boletim.aluno.matricula}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Email:</strong> {boletim.aluno.email}
                    </p>
                    {boletim.periodo.data_inicio && boletim.periodo.data_fim && (
                      <p className="mb-2">
                        <strong>Período:</strong>{' '}
                        {new Date(boletim.periodo.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(boletim.periodo.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumo Geral */}
              <div className="row mb-4 d-print-block">
                <div className="col-md-6">
                  <div className="card bg-primary text-white shadow-sm">
                    <div className="card-body text-center">
                      <h6 className="card-title mb-0">Média Geral</h6>
                      <h2 className="fw-bold mt-2">{calcularMediaGeral()}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-info text-white shadow-sm">
                    <div className="card-body text-center">
                      <h6 className="card-title mb-0">Frequência Geral</h6>
                      <h2 className="fw-bold mt-2">{calcularFrequenciaGeral()}%</h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disciplinas */}
              {boletim.disciplinas.length === 0 ? (
                <div className="alert alert-info d-print-none" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  Nenhuma disciplina encontrada no período selecionado
                </div>
              ) : (
                boletim.disciplinas.map((disciplina, index) => (
                  <div key={index} className="mb-4 pb-4 border-bottom page-break-inside-avoid">
                    <h5 className="mb-3 fw-bold text-primary">
                      <i className="bi bi-book me-2"></i>
                      {disciplina.disciplina} - {disciplina.turma_nome}
                    </h5>
                    
                    {disciplina.professor && (
                      <p className="text-secondary mb-3">
                        <strong>Professor(a):</strong> {disciplina.professor}
                      </p>
                    )}

                    {disciplina.periodo_letivo.data_inicio && disciplina.periodo_letivo.data_fim && (
                      <p className="text-secondary mb-3">
                        <strong>Período Letivo:</strong>{' '}
                        {new Date(disciplina.periodo_letivo.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(disciplina.periodo_letivo.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    )}

                    {/* Notas */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">
                        <i className="bi bi-journal-check me-2"></i>
                        Avaliações e Notas
                      </h6>
                      
                      {disciplina.notas.avaliacoes.length === 0 ? (
                        <p className="text-secondary">Nenhuma nota lançada</p>
                      ) : (
                        <div className="table-responsive boletim-table-wrapper">
                          <table className="table table-sm table-bordered boletim-table">
                            <thead>
                              <tr>
                                <th>Avaliação</th>
                                <th>Tipo</th>
                                <th>Data</th>
                                <th className="text-center">Nota</th>
                                <th className="text-center">Máxima</th>
                                <th className="text-center">Peso</th>
                              </tr>
                            </thead>
                            <tbody>
                              {disciplina.notas.avaliacoes.map((avaliacao, idx) => (
                                <tr key={idx}>
                                  <td>{avaliacao.avaliacao}</td>
                                  <td>
                                    <span className="badge bg-secondary">{avaliacao.tipo}</span>
                                  </td>
                                  <td>{new Date(avaliacao.data).toLocaleDateString('pt-BR')}</td>
                                  <td className="text-center fw-bold">{avaliacao.valor.toFixed(2)}</td>
                                  <td className="text-center">{avaliacao.nota_maxima.toFixed(2)}</td>
                                  <td className="text-center">{avaliacao.peso.toFixed(1)}</td>
                                </tr>
                              ))}
                              <tr className="table-primary">
                                <td colSpan={3} className="text-end fw-bold">Média da Disciplina:</td>
                                <td className="text-center fw-bold">{disciplina.notas.media.toFixed(2)}</td>
                                <td colSpan={2} className={`text-center fw-bold ${getStatusNota(disciplina.notas.media).class}`}>
                                  {getStatusNota(disciplina.notas.media).label}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Frequência */}
                    <div>
                      <h6 className="fw-bold mb-2">
                        <i className="bi bi-calendar-check me-2"></i>
                        Frequência
                      </h6>
                      
                      <div className="row g-2">
                        <div className="col-6 col-md-3">
                          <div className="card boletim-kpi-card">
                            <div className="card-body p-2 text-center">
                              <small className="text-secondary d-block">Total Aulas</small>
                              <strong>{disciplina.frequencia.total_aulas}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="card bg-success bg-opacity-10 border-success">
                            <div className="card-body p-2 text-center">
                              <small className="text-secondary d-block">Presenças</small>
                              <strong className="text-success">{disciplina.frequencia.presencas}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="card bg-danger bg-opacity-10 border-danger">
                            <div className="card-body p-2 text-center">
                              <small className="text-secondary d-block">Ausências</small>
                              <strong className="text-danger">{disciplina.frequencia.ausencias}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="card bg-info bg-opacity-10 border-info">
                            <div className="card-body p-2 text-center">
                              <small className="text-secondary d-block">% Presença</small>
                              <strong className={getStatusFrequencia(disciplina.frequencia.percentual_presenca).class}>
                                {disciplina.frequencia.percentual_presenca.toFixed(1)}%
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Legenda */}
              <div className="mt-4 p-3 rounded d-print-block boletim-legend-box">
                <h6 className="fw-bold mb-2">Legenda:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Situação por Nota:</strong></p>
                    <ul className="list-unstyled mb-0">
                      <li className="text-success">● Aprovado: Média ≥ 7,0</li>
                      <li className="text-warning">● Recuperação: 5,0 ≤ Média {'< 7,0'}</li>
                      <li className="text-danger">● Reprovado: Média {'< 5,0'}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Situação por Frequência:</strong></p>
                    <ul className="list-unstyled mb-0">
                      <li className="text-success">● Adequada: ≥ 75%</li>
                      <li className="text-warning">● Atenção: 60% a 74%</li>
                      <li className="text-danger">● Crítica: {'< 60%'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div className="mt-4 text-center text-secondary d-print-block">
                <small>
                  Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                </small>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .d-print-none {
            display: none !important;
          }
          .d-print-block {
            display: block !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          body {
            background: white;
          }
          .card {
            border: 1px solid #dee2e6 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BoletimAluno;
