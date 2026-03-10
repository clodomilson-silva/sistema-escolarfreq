import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { frequenciaAPI } from '../services/api';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { FrequenciaForm } from './FrequenciaForm';
import EstatisticasAluno from '../components/EstatisticasAluno';
import { Turma, Aluno, FrequenciaData, EstatisticasFrequencia } from '../types';

const FrequenciaDashboard: React.FC = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const { isReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingFreq, setLoadingFreq] = useState(false);
  const [error, setError] = useState<string>('');
  const [showFrequenciaForm, setShowFrequenciaForm] = useState(false);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [frequencias, setFrequencias] = useState<FrequenciaData[]>([]);
  const [estatisticas, setEstatisticas] = useState<{ [key: string]: EstatisticasFrequencia }>({});
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });

  // Função para carregar todos os dados necessários
  const carregarDados = useCallback(async () => {
    if (!isReady || !turmaId) return;
    
    try {
      setLoading(true);
      setError('');

      // Carregar dados da turma
      const turmaResponse = await api.get(`/turmas/${turmaId}/`);
      setTurma(turmaResponse.data.data);

      // Carregar alunos da turma
      const alunosResponse = await api.get(`/alunos/?turma_id=${turmaId}`);
      const alunosDaTurma = alunosResponse.data.data || [];
      setAlunos(alunosDaTurma);

      // Carregar frequências do dia selecionado
      setLoadingFreq(true);
      try {
        const frequenciasResponse = await frequenciaAPI.buscarPorTurmaEData(turmaId, dataSelecionada);
        const freqData = frequenciasResponse.data.data.map((f: FrequenciaData) => ({
          ...f,
          id: f.id || `${f.aluno}_${f.turma}_${f.data}`
        }));
        setFrequencias(freqData);
      } catch (err) {
        console.error('Erro ao carregar frequências:', err);
        setFrequencias([]);
      } finally {
        setLoadingFreq(false);
      }

      // Carregar estatísticas dos alunos
      if (alunosDaTurma.length > 0) {
        const estatisticasPromises = alunosDaTurma.map((aluno: Aluno) =>
          frequenciaAPI.obterEstatisticas(aluno.id, turmaId)
        );
        
        const estatisticasResults = await Promise.all(estatisticasPromises);
        const estatisticasMap: { [key: string]: EstatisticasFrequencia } = {};
        
        alunosDaTurma.forEach((aluno: Aluno, index: number) => {
          estatisticasMap[aluno.id] = estatisticasResults[index].data.data;
        });
        
        setEstatisticas(estatisticasMap);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da turma');
    } finally {
      setLoading(false);
    }
  }, [isReady, turmaId, dataSelecionada]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para lidar com o sucesso do registro de frequência
  const handleFrequenciaSuccess = useCallback(() => {
    carregarDados();
  }, [carregarDados]);

  // ... resto do código do componente permanece igual ...

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="text-muted">Carregando dashboard de frequência...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !turma) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="alert alert-danger">
            <h4>Erro</h4>
            <p>{error || 'Turma não encontrada'}</p>
            <Link to="/turmas" className="btn btn-primary">
              Voltar para Lista de Turmas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarTurno = (turno: string) => {
    const turnoMap: { [key: string]: { label: string; emoji: string } } = {
      'matutino': { label: 'Manhã', emoji: '🌅' },
      'vespertino': { label: 'Tarde', emoji: '☀️' },
      'noturno': { label: 'Noite', emoji: '🌙' },
      'integral': { label: 'Integral', emoji: '🌞' }
    };
    
    return turnoMap[turno] || { label: turno, emoji: '⏰' };
  };

  const turnoInfo = formatarTurno(turma.turno);
  const presentes = frequencias.filter(f => f.presente).length;
  const ausentes = frequencias.filter(f => !f.presente).length;
  const percentualPresenca = alunos.length ? ((presentes / alunos.length) * 100).toFixed(1) : '0';

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        {/* Cabeçalho */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="card-title mb-1">
                      📊 Dashboard de Frequência
                    </h2>
                    <div className="d-flex align-items-center gap-3 text-muted">
                      <span><strong>Turma:</strong> {turma.nome}</span>
                      <span><strong>Ano:</strong> {turma.ano}</span>
                      <span>
                        <strong>Turno:</strong> {turnoInfo.emoji} {turnoInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <Link 
                      to={`/turmas/${turmaId}`} 
                      className="btn btn-outline-primary me-2"
                    >
                      👁️ Ver Turma
                    </Link>
                    <Link 
                      to="/turmas" 
                      className="btn btn-outline-secondary"
                    >
                      📋 Lista de Turmas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de Data e Resumo */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">📅 Selecionar Data</h5>
                <input
                  type="date"
                  className="form-control"
                  value={dataSelecionada}
                  onChange={(e) => {
                    setDataSelecionada(e.target.value);
                    carregarDados(); // Recarregar dados ao mudar a data
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loadingFreq}
                />
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">📈 Resumo do Dia - {formatarData(dataSelecionada)}</h5>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowFrequenciaForm(true)}
                    disabled={!alunos.length || loadingFreq}
                  >
                    {loadingFreq ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Carregando...
                      </>
                    ) : (
                      <>📝 Registrar Frequência</>
                    )}
                  </button>
                </div>
                <div className="row text-center">
                  <div className="col-3">
                    <div className="text-primary">
                      <h3>{alunos.length}</h3>
                      <small>Total de Alunos</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-success">
                      <h3>{presentes}</h3>
                      <small>Presentes</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-warning">
                      <h3>{ausentes}</h3>
                      <small>Faltas</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="text-info">
                      <h3>{percentualPresenca}%</h3>
                      <small>Frequência</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Alunos com Frequência */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">👥 Frequência Individual dos Alunos</h5>
                <span className="badge bg-light text-primary">{alunos.length} alunos</span>
              </div>
              <div className="card-body p-0">
                {alunos.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3">📚</div>
                    <h5 className="text-muted">Nenhum aluno matriculado nesta turma</h5>
                    <p className="text-muted">Adicione alunos à turma para começar o registro de frequência.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '5%' }}>#</th>
                          <th style={{ width: '25%' }}>Aluno</th>
                          <th style={{ width: '10%' }}>RA</th>
                          <th style={{ width: '15%' }}>Status do Dia</th>
                          <th style={{ width: '20%' }}>Observações</th>
                          <th style={{ width: '25%' }}>Estatísticas Gerais</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map((aluno, index) => {
                          const freq = frequencias.find(f => f.aluno === aluno.id);
                          const stats = estatisticas[aluno.id];
                          
                          // Determinar cor da linha baseado no status
                          let statusCor = '';
                          if (stats) {
                            const perc = stats.percentual_presenca;
                            if (perc >= 90) statusCor = 'table-success-subtle';
                            else if (perc >= 75) statusCor = 'table-primary-subtle';
                            else if (perc >= 60) statusCor = 'table-warning-subtle';
                            else statusCor = 'table-danger-subtle';
                          }
                          
                          return (
                            <tr key={aluno.id} className={statusCor}>
                              <td className="text-center">
                                <span className="badge bg-secondary">{index + 1}</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                                       style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                                    {aluno.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="d-block">{aluno.nome}</strong>
                                    <small className="text-muted">Mat: {aluno.matricula}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <code className="bg-light px-2 py-1 rounded">{aluno.matricula}</code>
                              </td>
                              <td>
                                {loadingFreq ? (
                                  <div className="text-center">
                                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                  </div>
                                ) : freq ? (
                                  <div className="d-flex flex-column gap-1">
                                    <span className={`badge ${
                                      freq.status === 'presente' ? 'bg-success' : 
                                      freq.status === 'justificado' ? 'bg-info' : 
                                      'bg-warning'
                                    } fs-6`}>
                                      {freq.status === 'presente' ? '✅ Presente' : 
                                       freq.status === 'justificado' ? '📝 Justificado' : 
                                       '❌ Ausente'}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="badge bg-secondary fs-6">⏸️ Não registrado</span>
                                )}
                              </td>
                              <td>
                                {freq ? (
                                  <div className="small">
                                    {freq.observacoes && (
                                      <div className="mb-1">
                                        <span className="badge bg-info text-dark me-1">💬</span>
                                        <span className="text-muted">{freq.observacoes}</span>
                                      </div>
                                    )}
                                    {!freq.observacoes && (
                                      <span className="text-muted fst-italic">Sem observações</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted fst-italic">—</span>
                                )}
                              </td>
                              <td>
                                {stats ? (
                                  <EstatisticasAluno estatisticas={stats} compacto={true} />
                                ) : (
                                  <div className="text-center">
                                    <small className="text-muted">Sem dados</small>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Estatístico Geral */}
        {alunos.length > 0 && Object.keys(estatisticas).length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">📊 Resumo Estatístico da Turma</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {(() => {
                      const todosStats = Object.values(estatisticas);
                      const mediaPresenca = todosStats.reduce((acc, s) => acc + s.percentual_presenca, 0) / todosStats.length;
                      const mediaFaltas = 100 - mediaPresenca;
                      const excelentes = todosStats.filter(s => s.percentual_presenca >= 90).length;
                      const bons = todosStats.filter(s => s.percentual_presenca >= 75 && s.percentual_presenca < 90).length;
                      const regulares = todosStats.filter(s => s.percentual_presenca >= 60 && s.percentual_presenca < 75).length;
                      const criticos = todosStats.filter(s => s.percentual_presenca < 60).length;

                      return (
                        <>
                          <div className="col-md-3">
                            <div className="card bg-light border-0">
                              <div className="card-body text-center">
                                <h3 className="text-primary mb-1">{mediaPresenca.toFixed(1)}%</h3>
                                <p className="text-muted mb-0 small">Média de Presença</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-success bg-opacity-10 border-success">
                              <div className="card-body text-center">
                                <h3 className="text-success mb-1">🌟 {excelentes}</h3>
                                <p className="text-muted mb-0 small">Excelente (≥90%)</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-primary bg-opacity-10 border-primary">
                              <div className="card-body text-center">
                                <h3 className="text-primary mb-1">👍 {bons}</h3>
                                <p className="text-muted mb-0 small">Bom (75-89%)</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-warning bg-opacity-10 border-warning">
                              <div className="card-body text-center">
                                <h3 className="text-warning mb-1">⚠️ {regulares}</h3>
                                <p className="text-muted mb-0 small">Regular (60-74%)</p>
                              </div>
                            </div>
                          </div>
                          {criticos > 0 && (
                            <div className="col-md-12">
                              <div className="alert alert-danger d-flex align-items-center mb-0">
                                <span className="fs-3 me-3">🚨</span>
                                <div>
                                  <strong>Atenção!</strong> {criticos} aluno(s) com frequência crítica (&lt;60%). 
                                  É necessário intervenção pedagógica urgente.
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Frequência */}
        {showFrequenciaForm && (
          <FrequenciaForm
            turmaId={turmaId!}
            alunos={alunos}
            onClose={() => setShowFrequenciaForm(false)}
            onSuccess={handleFrequenciaSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default FrequenciaDashboard;