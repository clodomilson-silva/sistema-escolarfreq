import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./ListPages.css";

interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  tipo?: 'base' | 'disciplina';
  nivel_ensino?: 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante';
  disciplina?: string;
  professor?: string;
  professor_nome?: string;
  professor_dados?: {
    nome: string;
    matricula?: string | null;
  } | null;
  turma_base_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}

function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtroNivelEnsino, setFiltroNivelEnsino] = useState<'todos' | 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante'>('todos');
  const [loading, setLoading] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);
  const navigate = useNavigate();
  const { isReady, admin } = useAuth();

  console.log('========== TurmasList Renderizando ==========');
  console.log('isReady:', isReady);
  console.log('admin:', admin);
  console.log('loading:', loading);
  console.log('turmas:', turmas);
  console.log('turmas é array?', Array.isArray(turmas));
  console.log('turmas.length:', Array.isArray(turmas) ? turmas.length : 'NÃO É ARRAY!');

  // Renderização de fallback se nada funcionar
  if (!isReady && loading) {
    console.log('⚠️ isReady é false e loading é true - mostrando indicador inicial');
    return (
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Inicializando...</span>
            </div>
            <p className="mt-2">Inicializando sistema...</p>
            <p className="text-secondary">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Função para mapear turnos do backend para exibição
  const formatarTurno = (turno: string) => {
    const turnoMap: { [key: string]: { label: string; icon: string; color: string } } = {
      'matutino': { label: 'Manhã', icon: 'bi-sunrise', color: 'bg-warning' },
      'vespertino': { label: 'Tarde', icon: 'bi-sun', color: 'bg-info' },
      'noturno': { label: 'Noite', icon: 'bi-moon-stars', color: 'bg-dark' },
      'integral': { label: 'Integral', icon: 'bi-brightness-high', color: 'bg-success' }
    };
    
    return turnoMap[turno] || { label: turno, icon: 'bi-clock', color: 'bg-secondary' };
  };

  const formatarNivelEnsino = (nivel?: string) => {
    const nivelMap: Record<string, { label: string; color: string }> = {
      fundamental: { label: 'Fundamental', color: 'bg-primary' },
      medio: { label: 'Medio', color: 'bg-secondary' },
      tecnico: { label: 'Tecnico', color: 'bg-warning text-dark' },
      profissionalizante: { label: 'Profissionalizante', color: 'bg-success' }
    };

    return nivelMap[nivel || ''] || { label: 'Nao informado', color: 'bg-light text-dark' };
  };

  useEffect(() => {
    console.log('useEffect executado - isReady:', isReady);
    if (isReady) {
      console.log('isReady é true, carregando turmas...');
      carregarTurmas();
    } else {
      console.log('isReady é false, aguardando...');
      // Timeout de segurança: após 3 segundos, carrega mesmo se isReady for false
      const timeout = setTimeout(() => {
        console.log('Timeout: forçando carregamento de turmas após 3s');
        carregarTurmas();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isReady]);

  const carregarTurmas = async () => {
    try {
      console.log('⏳ Iniciando carregamento de turmas...');
      setLoading(true);
      console.log('📡 Fazendo requisição para /turmas/...');
      const response = await api.get("/turmas/");
      console.log('✅ Resposta recebida:', response.data);
      console.log('📦 response.data completo:', JSON.stringify(response.data, null, 2));
      console.log('📦 Chaves de response.data:', Object.keys(response.data));
      console.log('📦 Tipo de response.data:', typeof response.data);
      console.log('📦 Tipo de response.data.data:', typeof response.data.data);
      console.log('📦 É array?', Array.isArray(response.data.data));
      
      // Salvar dados de debug
      setDebugData(response.data);
      
      // A API retorna { success: true, data: [...], total: number }
      let turmas = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('✓ Usando response.data.data (formato normal)');
        turmas = response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('✓ response.data é direto um array');
        turmas = response.data;
      } else if (response.data.data && typeof response.data.data === 'object') {
        console.log('✓ response.data.data é objeto, convertendo para array');
        turmas = Object.values(response.data.data);
      } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        console.log('✓ response.data é objeto (não array), tentando Object.values()');
        const valores = Object.values(response.data);
        console.log('📦 Valores extraídos:', valores);
        // Verificar se algum dos valores é um array
        const arrayEncontrado = valores.find(v => Array.isArray(v));
        if (arrayEncontrado) {
          console.log('✓ Array encontrado nos valores!');
          turmas = arrayEncontrado as any[];
        } else {
          console.log('⚠️ Nenhum array encontrado');
          turmas = [];
        }
      } else {
        console.warn('⚠️ Formato de resposta inesperado, usando array vazio');
        turmas = [];
      }
      
      console.log('📋 Turmas extraídas:', turmas);
      console.log('📊 Quantidade de turmas:', turmas.length);
      console.log('📊 É array agora?', Array.isArray(turmas));
      setTurmas(turmas);
      console.log('✅ Estado de turmas atualizado');
    } catch (error) {
      console.error("❌ Erro ao buscar turmas:", error);
      
      let mensagem = "Erro ao carregar turmas!";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };
        
        if (axiosError.response?.data?.message) {
          mensagem = axiosError.response.data.message;
        } else if (axiosError.response?.status === 401) {
          mensagem = "Não autorizado. Faça login novamente.";
        } else if (axiosError.response?.status === 500) {
          mensagem = "Erro interno do servidor!";
        } else if (!axiosError.response) {
          mensagem = "Erro de conexão com o servidor!";
        }
      }
      
      alert(mensagem);
    } finally {
      console.log('🏁 Finalizando carregamento - setLoading(false)');
      setLoading(false);
      console.log('✅ Loading definido como false');
    }
  };

  const excluirTurma = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        await api.delete(`/turmas/${id}/`);
        alert("Turma excluída com sucesso!");
        carregarTurmas();
      } catch (error) {
        console.error("Erro ao excluir turma:", error);
        alert("Erro ao excluir turma!");
      }
    }
  };

  const turmasFiltradas = turmas.filter((turma) => {
    if (filtroNivelEnsino === 'todos') {
      return true;
    }
    return turma.nivel_ensino === filtroNivelEnsino;
  });

  if (loading) {
    console.log('Renderizando estado de loading...');
    return (
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando turmas...</p>
            <p className="text-secondary">isReady: {isReady ? 'true' : 'false'}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Renderizando lista de turmas...');
  
  return (
    <div className="min-vh-100 turmas-list-page" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="page-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--success-color), #20c997)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <i className="bi bi-grid-3x3-gap" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', margin: 0 }}>Lista de Turmas</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {admin?.role === 'admin' 
                  ? 'Gerencie turmas base e turmas-disciplina do PontoClass'
                  : 'Crie e gerencie suas turmas-disciplina'}
              </p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/home" className="btn btn-outline-secondary">
              <i className="bi bi-house-door me-2"></i>Voltar para Home
            </Link>
            {admin?.role === 'admin' && (
              <>
                <Link to="/turmas/disciplina/nova" className="btn btn-info">
                  <i className="bi bi-journal-check me-2"></i>Criar Turma-Disciplina
                </Link>
                <Link to="/turmas/nova" className="btn btn-success">
                  <i className="bi bi-plus-circle me-2"></i>Cadastrar Turma Base
                </Link>
              </>
            )}
          </div>
              
          {/* Debug info */}
          <div className="alert mt-3" style={{
            background: 'rgba(13, 110, 253, 0.1)',
            border: '1px solid rgba(13, 110, 253, 0.2)',
            color: 'var(--info-color)',
            borderRadius: 'var(--radius-md)'
          }}>
            <strong>Debug:</strong> Turmas carregadas: {Array.isArray(turmas) ? turmas.length : 'NÃO É ARRAY'} | 
            Tipo: {typeof turmas} | 
            É Array: {Array.isArray(turmas) ? 'Sim' : 'Não'} |
            Exibidas: {turmasFiltradas.length}
            {debugData && (
              <>
                <br />
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => {
                    console.log('Debug Data Completo:', debugData);
                    alert('Dados no console! Pressione F12 para ver.');
                  }}
                >
                  Mostrar Dados Brutos no Console
                </button>
              </>
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-2 align-items-end mb-3">
                  <div className="col-12 col-md-4">
                    <label htmlFor="filtro-nivel-ensino" className="form-label mb-1">Filtrar por nivel de ensino</label>
                    <select
                      id="filtro-nivel-ensino"
                      className="form-select"
                      value={filtroNivelEnsino}
                      onChange={(e) => setFiltroNivelEnsino(e.target.value as 'todos' | 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante')}
                    >
                      <option value="todos">Todos</option>
                      <option value="fundamental">Fundamental</option>
                      <option value="medio">Medio</option>
                      <option value="tecnico">Tecnico</option>
                      <option value="profissionalizante">Profissionalizante</option>
                    </select>
                  </div>
                </div>

                {!Array.isArray(turmas) || turmas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <i className="bi bi-grid-3x3-gap" style={{ fontSize: '4rem', color: 'var(--text-secondary)' }}></i>
                    </div>
                    <h4 style={{ color: 'var(--text-primary)' }}>
                      {!Array.isArray(turmas) ? 'Erro ao carregar turmas' : 'Nenhuma turma cadastrada'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {!Array.isArray(turmas) 
                        ? 'Ocorreu um erro ao processar os dados. Tente recarregar a página.' 
                        : 'Comece criando a primeira turma para organizar os alunos!'}
                    </p>
                    {Array.isArray(turmas) && (
                      <Link to="/turmas/nova" className="btn btn-success mt-3">
                        <i className="bi bi-plus-circle me-2"></i>Cadastrar Primeira Turma
                      </Link>
                    )}
                  </div>
                ) : turmasFiltradas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <i className="bi bi-funnel" style={{ fontSize: '4rem', color: 'var(--text-secondary)' }}></i>
                    </div>
                    <h4 style={{ color: 'var(--text-primary)' }}>Nenhuma turma para o filtro selecionado</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Ajuste o filtro de nivel de ensino para visualizar outras turmas.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover turmas-list-table">
                      <thead>
                        <tr>
                          <th>Nome da Turma</th>
                          <th>Tipo</th>
                          <th>Disciplina</th>
                          <th>Nivel de Ensino</th>
                          <th>Professor</th>
                          <th>Ano</th>
                          <th>Turno</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turmasFiltradas.map((turma) => {
                          const turnoInfo = formatarTurno(turma.turno);
                          const nivelEnsinoInfo = formatarNivelEnsino(turma.nivel_ensino);
                          const ehDisciplina = turma.tipo === 'disciplina';
                          
                          return (
                            <tr key={turma.id} style={ehDisciplina ? { background: 'rgba(13, 202, 240, 0.14)' } : {}}>
                              <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                {ehDisciplina && '└─ '}
                                {turma.nome}
                              </td>
                              <td>
                                <span className={`badge ${ehDisciplina ? 'bg-info' : 'bg-primary'}`}>
                                  <i className={`bi ${ehDisciplina ? 'bi-journal-check' : 'bi-grid-3x3-gap'} me-1`}></i>
                                  {ehDisciplina ? 'Disciplina' : 'Base'}
                                </span>
                              </td>
                              <td>
                                {turma.disciplina ? (
                                  <span className="badge bg-success">{turma.disciplina}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)' }}>—</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${nivelEnsinoInfo.color}`}>{nivelEnsinoInfo.label}</span>
                              </td>
                              <td>
                                {(turma.professor_dados?.nome || turma.professor || turma.professor_nome) ? (
                                  <small style={{ color: 'var(--text-secondary)' }}>
                                    <i className="bi bi-person-badge me-1"></i>
                                    {turma.professor_dados?.nome || turma.professor || turma.professor_nome}
                                    {turma.professor_dados?.matricula ? ` (Matricula ${turma.professor_dados.matricula})` : ''}
                                  </small>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)' }}>—</span>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-secondary">{turma.ano}</span>
                              </td>
                              <td>
                                <span className={`badge ${turnoInfo.color}`}>
                                  <i className={`bi ${turnoInfo.icon} me-1`}></i>{turnoInfo.label}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    onClick={() => navigate(`/turmas/${turma.id}`)}
                                    className="btn btn-sm btn-outline-info"
                                    title="Ver detalhes"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  {(admin?.role === 'admin' || admin?.role === 'professor') && (
                                    <button
                                      onClick={() => navigate(`/turmas/${turma.id}/frequencia`)}
                                      className="btn btn-sm btn-outline-success"
                                      title="Frequência"
                                    >
                                      <i className="bi bi-calendar-check"></i>
                                    </button>
                                  )}
                                  {admin?.role === 'admin' && (
                                    <>
                                      <button
                                        onClick={() => navigate(`/turmas/editar/${turma.id}`)}
                                        className="btn btn-sm btn-outline-warning"
                                        title="Editar"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button
                                        onClick={() => excluirTurma(turma.id)}
                                        className="btn btn-sm btn-outline-danger"
                                        title="Excluir"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </>
                                  )}
                                </div>
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
      </div>
    </div>
  );
}

export default TurmasList;
