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
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
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
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
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
    const turnoMap: { [key: string]: { label: string; icon: string } } = {
      'matutino': { label: 'Manhã', icon: 'bi-sunrise' },
      'vespertino': { label: 'Tarde', icon: 'bi-sun' },
      'noturno': { label: 'Noite', icon: 'bi-moon-stars' },
      'integral': { label: 'Integral', icon: 'bi-brightness-high' }
    };
    
    return turnoMap[turno] || { label: turno, icon: 'bi-clock' };
  };

  const turnoInfo = formatarTurno(turma.turno);
  
  // Calcular estatísticas com verificação de tipo
  const frequenciasValidas = frequencias.filter(f => f.status !== undefined);
  const presentes = frequenciasValidas.filter(f => f.status === 'presente').length;
  const ausentes = frequenciasValidas.filter(f => f.status === 'ausente').length;
  const justificados = frequenciasValidas.filter(f => f.status === 'justificado').length;
  const naoRegistrados = alunos.length - frequenciasValidas.length;
  const percentualPresenca = alunos.length ? ((presentes / alunos.length) * 100).toFixed(1) : '0';

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar />
      
      {/* Cabeçalho Principal */}
      <div className="bg-gradient" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem 0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="text-white">
              <h1 className="h3 mb-2 fw-bold">
                <i className="bi bi-graph-up me-2"></i>
                Dashboard de Frequência
              </h1>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <span className="badge bg-white bg-opacity-25 px-3 py-2">
                  <i className="bi bi-building me-1"></i>
                  <strong>Turma:</strong> {turma.nome}
                </span>
                <span className="badge bg-white bg-opacity-25 px-3 py-2">
                  <i className="bi bi-calendar-event me-1"></i>
                  <strong>Ano:</strong> {turma.ano}
                </span>
                <span className="badge bg-white bg-opacity-25 px-3 py-2">
                  <i className={`bi ${turnoInfo.icon} me-1`}></i> <strong>Turno:</strong> {turnoInfo.label}
                </span>
                <span className="badge bg-white bg-opacity-25 px-3 py-2">
                  <i className="bi bi-people-fill me-1"></i>
                  <strong>{alunos.length}</strong> alunos
                </span>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Link 
                to={`/turmas/${turmaId}`} 
                className="btn btn-light btn-sm shadow-sm"
              >
                <i className="bi bi-eye me-1"></i> Ver Detalhes
              </Link>
              <Link 
                to="/turmas" 
                className="btn btn-outline-light btn-sm"
              >
                <i className="bi bi-arrow-left me-1"></i> Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-4">
        {/* Layout Grid de 2 Colunas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Coluna Principal: Conteúdo do Dashboard */}
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            {/* Cards de Resumo com KPIs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
          {/* Seletor de Data */}
          <div>
            <div className="card border-0 shadow-sm" style={{ height: '100%', minHeight: '180px' }}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <i className="bi bi-calendar3 text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-0 small">Selecionar Data</h6>
                    <small className="text-muted">{formatarData(dataSelecionada)}</small>
                  </div>
                </div>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loadingFreq}
                />
              </div>
            </div>
          </div>

          {/* Card Presentes */}
          <div>
            <div className="card border-0 shadow-sm border-start border-success border-4" style={{ height: '100%', minHeight: '180px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2 text-uppercase small fw-semibold">Presentes</h6>
                    <h2 className="mb-0 fw-bold text-success">{presentes}</h2>
                    <small className="text-muted">de {alunos.length} alunos</small>
                  </div>
                  <div className="rounded-circle bg-success bg-opacity-10 p-3">
                    <i className="bi bi-check-circle-fill text-success fs-4"></i>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${alunos.length ? (presentes / alunos.length * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Ausentes */}
          <div>
            <div className="card border-0 shadow-sm border-start border-warning border-4" style={{ height: '100%', minHeight: '180px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2 text-uppercase small fw-semibold">Ausentes</h6>
                    <h2 className="mb-0 fw-bold text-warning">{ausentes}</h2>
                    <small className="text-muted">
                      {justificados > 0 && `(${justificados} justif.)`}
                    </small>
                  </div>
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                    <i className="bi bi-x-circle-fill text-warning fs-4"></i>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: `${alunos.length ? (ausentes / alunos.length * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Taxa de Frequência */}
          <div>
            <div className="card border-0 shadow-sm border-start border-primary border-4" style={{ height: '100%', minHeight: '180px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2 text-uppercase small fw-semibold">Taxa de Frequência</h6>
                    <h2 className="mb-0 fw-bold text-primary">{percentualPresenca}%</h2>
                    <small className={`badge ${parseFloat(percentualPresenca) >= 75 ? 'bg-success' : 'bg-danger'} mt-1`}>
                      {parseFloat(percentualPresenca) >= 75 ? 'Dentro da meta' : 'Abaixo da meta'}
                    </small>
                  </div>
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                    <i className="bi bi-graph-up-arrow text-primary fs-4"></i>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${parseFloat(percentualPresenca) >= 75 ? 'bg-success' : 'bg-danger'}`}
                    role="progressbar" 
                    style={{ width: `${percentualPresenca}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mb-4">

            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-people-fill text-primary me-2"></i>
                      Lista de Alunos - {formatarData(dataSelecionada)}
                    </h5>
                    <small className="text-muted">
                      {naoRegistrados > 0 
                        ? `${naoRegistrados} aluno${naoRegistrados > 1 ? 's' : ''} sem registro de frequência`
                        : 'Todos os alunos registrados'}
                    </small>
                  </div>
                  <button
                    className="btn btn-primary btn-lg shadow-sm"
                    onClick={() => setShowFrequenciaForm(true)}
                    disabled={!alunos.length || loadingFreq}
                  >
                    {loadingFreq ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Carregando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil-square me-2"></i>
                        Registrar Frequência
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        </div>

        {/* Lista de Alunos com Frequência */}
        <div className="mb-4">

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {alunos.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-people text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h5 className="text-muted mb-2">Nenhum aluno matriculado</h5>
                    <p className="text-muted small">Adicione alunos à turma para começar o registro de frequência.</p>
                    <Link to={`/turmas/${turmaId}`} className="btn btn-primary mt-2">
                      <i className="bi bi-plus-circle me-2"></i>
                      Gerenciar Alunos
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <tr>
                          <th className="px-4 py-3" style={{ width: '5%' }}>
                            <small className="text-muted fw-semibold">#</small>
                          </th>
                          <th className="px-3 py-3" style={{ width: '30%' }}>
                            <small className="text-muted fw-semibold">ALUNO</small>
                          </th>
                          <th className="px-3 py-3 text-center" style={{ width: '15%' }}>
                            <small className="text-muted fw-semibold">STATUS</small>
                          </th>
                          <th className="px-3 py-3" style={{ width: '25%' }}>
                            <small className="text-muted fw-semibold">OBSERVAÇÕES</small>
                          </th>
                          <th className="px-3 py-3 text-center" style={{ width: '25%' }}>
                            <small className="text-muted fw-semibold">ESTATÍSTICAS GERAIS</small>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map((aluno, index) => {
                          const freq = frequencias.find(f => f.aluno === aluno.id);
                          const stats = estatisticas[aluno.id];
                          
                          return (
                            <tr key={aluno.id} className="border-bottom">
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center justify-content-center">
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
                                    {index + 1}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold shadow-sm"
                                    style={{ 
                                      width: '48px', 
                                      height: '48px', 
                                      background: `linear-gradient(135deg, ${
                                        ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][index % 5]
                                      } 0%, ${
                                        ['#764ba2', '#667eea', '#4facfe', '#00f2fe', '#38f9d7'][index % 5]
                                      } 100%)`,
                                      color: 'white',
                                      fontSize: '1.2rem'
                                    }}
                                  >
                                    {aluno.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark mb-1">{aluno.nome}</div>
                                    <div className="d-flex gap-2 align-items-center">
                                      <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                        <i className="bi bi-person-badge me-1"></i>
                                        {aluno.matricula}
                                      </span>
                                      {stats && (
                                        <span className={`badge ${
                                          stats.percentual_presenca >= 90 ? 'bg-success' :
                                          stats.percentual_presenca >= 75 ? 'bg-primary' :
                                          stats.percentual_presenca >= 60 ? 'bg-warning' :
                                          'bg-danger'
                                        }`}>
                                          {stats.percentual_presenca.toFixed(0)}% geral
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="d-flex justify-content-center">
                                  {loadingFreq ? (
                                    <span className="spinner-border spinner-border-sm text-primary"></span>
                                  ) : freq ? (
                                    <span className={`badge fs-6 px-3 py-2 ${
                                      freq.status === 'presente' ? 'bg-success shadow-sm' : 
                                      freq.status === 'justificado' ? 'bg-info shadow-sm' : 
                                      'bg-warning shadow-sm'
                                    }`}>
                                      <i className={`bi ${
                                        freq.status === 'presente' ? 'bi-check-circle-fill' :
                                        freq.status === 'justificado' ? 'bi-file-earmark-text' :
                                        'bi-x-circle-fill'
                                      } me-1`}></i>
                                      {freq.status === 'presente' ? 'Presente' : 
                                       freq.status === 'justificado' ? 'Justificado' : 
                                       'Ausente'}
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary fs-6 px-3 py-2">
                                      <i className="bi bi-dash-circle me-1"></i>
                                      Não registrado
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                {freq?.observacoes ? (
                                  <div className="d-flex align-items-start">
                                    <i className="bi bi-chat-left-quote text-primary me-2 mt-1"></i>
                                    <small className="text-muted">{freq.observacoes}</small>
                                  </div>
                                ) : (
                                  <small className="text-muted fst-italic">—</small>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                {stats ? (
                                  <div className="d-flex justify-content-center gap-3">
                                    <div className="text-center">
                                      <div className="fw-bold text-success">{stats.presencas}</div>
                                      <small className="text-muted">Presenças</small>
                                    </div>
                                    <div className="text-center">
                                      <div className="fw-bold text-warning">{stats.ausencias}</div>
                                      <small className="text-muted">Faltas</small>
                                    </div>
                                    <div className="text-center">
                                      <div className="fw-bold text-info">{stats.justificadas}</div>
                                      <small className="text-muted">Justif.</small>
                                    </div>
                                  </div>
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
                )}              </div>
            </div>
        </div>
          </div>

          {/* Sidebar Direita: Resumo Estatístico Geral */}
          {alunos.length > 0 && Object.keys(estatisticas).length > 0 && (
            <div style={{ minWidth: 0 }}>
              <div className="card border-0 shadow-sm" style={{ position: 'sticky', top: '1rem' }}>
                <div className="card-header bg-white border-bottom py-3 px-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                      <i className="bi bi-bar-chart-fill text-info fs-5"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Análise Geral</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>Desempenho da turma</small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  {(() => {
                    const todosStats = Object.values(estatisticas);
                    const mediaPresenca = todosStats.reduce((acc, s) => acc + s.percentual_presenca, 0) / todosStats.length;
                    const totalPresencas = todosStats.reduce((acc, s) => acc + s.presencas, 0);
                    const totalAusencias = todosStats.reduce((acc, s) => acc + s.ausencias, 0);
                    const totalJustificadas = todosStats.reduce((acc, s) => acc + s.justificadas, 0);
                    const excelentes = todosStats.filter(s => s.percentual_presenca >= 90).length;
                    const bons = todosStats.filter(s => s.percentual_presenca >= 75 && s.percentual_presenca < 90).length;
                    const regulares = todosStats.filter(s => s.percentual_presenca >= 60 && s.percentual_presenca < 75).length;
                    const criticos = todosStats.filter(s => s.percentual_presenca < 60).length;

                    return (
                      <>
                        {/* Métricas Principais */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div className="p-3 rounded-3" style={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              minHeight: '140px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div className="text-white">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div className="flex-grow-1">
                                    <small className="opacity-75 d-block mb-2">Média Geral de Frequência</small>
                                    <h1 className="mb-0 fw-bold display-4">{mediaPresenca.toFixed(1)}%</h1>
                                  </div>
                                  <i className="bi bi-graph-up-arrow display-3 opacity-25"></i>
                                </div>
                                <div className="progress bg-white bg-opacity-25" style={{ height: '8px', borderRadius: '10px' }}>
                                  <div className="progress-bar bg-white" style={{ width: `${mediaPresenca}%`, borderRadius: '10px' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="p-3 rounded-3" style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              minHeight: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div className="text-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <small className="opacity-75 d-block mb-1">Presenças</small>
                                    <h3 className="mb-0 fw-bold">{totalPresencas}</h3>
                                  </div>
                                  <i className="bi bi-check-circle-fill opacity-50 fs-3"></i>
                                </div>
                                <small className="opacity-75">Total acumulado</small>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="p-3 rounded-3" style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              minHeight: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div className="text-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <small className="opacity-75 d-block mb-1">Ausências</small>
                                    <h3 className="mb-0 fw-bold">{totalAusencias}</h3>
                                  </div>
                                  <i className="bi bi-x-circle-fill opacity-50 fs-3"></i>
                                </div>
                                <small className="opacity-75">Requer atenção</small>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="p-3 rounded-3" style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              minHeight: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div className="text-white">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <small className="opacity-75 d-block mb-1">Justificadas</small>
                                    <h3 className="mb-0 fw-bold">{totalJustificadas}</h3>
                                  </div>
                                  <i className="bi bi-file-earmark-check-fill opacity-50 fs-3"></i>
                                </div>
                                <small className="opacity-75">Documentadas</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Distribuição por Faixa */}
                        <div className="border-top pt-4 mt-3">
                          <h6 className="mb-3 fw-bold">
                            <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                            Distribuição
                          </h6>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.75rem'
                          }}>
                            <div>
                              <div className="card border-0 shadow-sm" style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                minHeight: '140px',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <div className="card-body text-center text-white p-3 d-flex flex-column justify-content-between">
                                  <div>
                                    <i className="bi bi-star-fill fs-2 mb-2 opacity-75"></i>
                                    <h2 className="fw-bold mb-1">{excelentes}</h2>
                                    <p className="small mb-2 opacity-90">Excelente</p>
                                  </div>
                                  <span className="badge bg-white text-success fw-semibold">≥ 90%</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="card border-0 shadow-sm" style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                minHeight: '140px',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <div className="card-body text-center text-white p-3 d-flex flex-column justify-content-between">
                                  <div>
                                    <i className="bi bi-hand-thumbs-up-fill fs-2 mb-2 opacity-75"></i>
                                    <h2 className="fw-bold mb-1">{bons}</h2>
                                    <p className="small mb-2 opacity-90">Bom</p>
                                  </div>
                                  <span className="badge bg-white text-primary fw-semibold">75-89%</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="card border-0 shadow-sm" style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                minHeight: '140px',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <div className="card-body text-center text-white p-3 d-flex flex-column justify-content-between">
                                  <div>
                                    <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 opacity-75"></i>
                                    <h2 className="fw-bold mb-1">{regulares}</h2>
                                    <p className="small mb-2 opacity-90">Regular</p>
                                  </div>
                                  <span className="badge bg-white text-warning fw-semibold">60-74%</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="card border-0 shadow-sm" style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                minHeight: '140px',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <div className="card-body text-center text-white p-3 d-flex flex-column justify-content-between">
                                  <div>
                                    <i className="bi bi-shield-fill-exclamation fs-2 mb-2 opacity-75"></i>
                                    <h2 className="fw-bold mb-1">{criticos}</h2>
                                    <p className="small mb-2 opacity-90">Crítico</p>
                                  </div>
                                  <span className="badge bg-white text-danger fw-semibold">{'< 60%'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Alerta de Atenção */}
                          {criticos > 0 && (
                            <div className="alert alert-danger border-0 shadow-sm mt-4 mb-0">
                              <div className="d-flex align-items-start">
                                <i className="bi bi-exclamation-triangle-fill fs-2 me-3 mt-1"></i>
                                <div className="flex-grow-1">
                                  <h5 className="alert-heading mb-3">
                                    <strong>Atenção Necessária!</strong>
                                  </h5>
                                  <p className="mb-3 fs-6">
                                    <strong className="fs-5">{criticos}</strong> aluno{criticos > 1 ? 's' : ''} com frequência <strong>crítica</strong> (abaixo de 60%).
                                  </p>
                                  <div className="bg-white bg-opacity-50 rounded p-3">
                                    <p className="small mb-0">
                                      <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
                                      <strong>Recomendação:</strong> Realizar intervenção pedagógica imediata, contatar responsáveis e investigar possíveis causas de ausência.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mensagem de Sucesso */}
                          {criticos === 0 && mediaPresenca >= 85 && (
                            <div className="alert alert-success border-0 shadow-sm mt-4 mb-0">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-check-circle-fill fs-2 me-3"></i>
                                <div>
                                  <h5 className="alert-heading mb-2">
                                    <strong>Parabéns!</strong>
                                  </h5>
                                  <p className="mb-0 fs-6">
                                    A turma apresenta excelente taxa de frequência. Continue o bom trabalho!
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
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