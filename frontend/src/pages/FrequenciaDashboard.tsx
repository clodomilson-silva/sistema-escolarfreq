import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { frequenciaAPI } from '../services/api';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { FrequenciaForm } from './FrequenciaForm';
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
      const turmaResponse = await api.get(`/turmas/${turmaId}`);
      setTurma(turmaResponse.data.data);

      // Carregar alunos da turma
      const alunosResponse = await api.get(`/alunos?turma_id=${turmaId}`);
      const alunosDaTurma = alunosResponse.data.data || [];
      setAlunos(alunosDaTurma);

      // Carregar frequências do dia selecionado
      setLoadingFreq(true);
      try {
        type APIFrequenciaData = {
          id?: string;
          aluno_id: string;
          turma_id: string;
          data: string | Date;
          presente: boolean;
          observacoes?: string;
          justificativa?: string;
        };
        
        const frequenciasResponse = await frequenciaAPI.buscarPorTurmaEData(turmaId, dataSelecionada);
        const freqData = frequenciasResponse.data.map((f: APIFrequenciaData) => {
          const data = typeof f.data === 'string' ? f.data : f.data.toISOString().split('T')[0];
          return {
            ...f,
            data,
            id: f.id || `${f.aluno_id}_${f.turma_id}_${data}`
          } as FrequenciaData;
        });
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
          estatisticasMap[aluno.id] = estatisticasResults[index].data;
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
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">👥 Frequência dos Alunos</h5>
                <span className="badge bg-primary">{alunos.length} alunos</span>
              </div>
              <div className="card-body p-0">
                {alunos.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-people display-4 text-muted"></i>
                    <p className="text-muted mt-2">Nenhum aluno matriculado nesta turma.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Aluno</th>
                          <th>RA</th>
                          <th>Status ({formatarData(dataSelecionada)})</th>
                          <th>Observações</th>
                          <th>Estatísticas Gerais</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map(aluno => {
                          const freq = frequencias.find(f => f.aluno_id === aluno.id);
                          const stats = estatisticas[aluno.id];
                          
                          return (
                            <tr key={aluno.id}>
                              <td>
                                <strong>{aluno.nome}</strong>
                              </td>
                              <td>
                                <code>{aluno.ra}</code>
                              </td>
                              <td>
                                {loadingFreq ? (
                                  <div className="text-center">
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                  </div>
                                ) : freq ? (
                                  <span className={`badge ${freq.presente ? 'bg-success' : 'bg-warning'}`}>
                                    {freq.presente ? '✅ Presente' : '❌ Falta'}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">⏸️ Não registrado</span>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {freq?.observacoes && (
                                    <div><strong>Obs:</strong> {freq.observacoes}</div>
                                  )}
                                  {freq?.justificativa && (
                                    <div><strong>Just:</strong> {freq.justificativa}</div>
                                  )}
                                  {!freq?.observacoes && !freq?.justificativa && '—'}
                                </small>
                              </td>
                              <td>
                                {stats && (
                                  <div className="small">
                                    <div><strong>{stats.percentual_presenca}%</strong> de presença</div>
                                    <div className="text-muted">
                                      {stats.presencas}P / {stats.faltas}F / {stats.total_dias}T
                                    </div>
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