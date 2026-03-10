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
  disciplina?: string;
  professor_nome?: string;
  turma_base_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}

function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
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
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Inicializando...</span>
            </div>
            <p className="mt-2">Inicializando sistema...</p>
            <p className="text-muted">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Função para mapear turnos do backend para exibição
  const formatarTurno = (turno: string) => {
    const turnoMap: { [key: string]: { label: string; emoji: string; color: string } } = {
      'matutino': { label: 'Manhã', emoji: '🌅', color: 'bg-warning' },
      'vespertino': { label: 'Tarde', emoji: '☀️', color: 'bg-info' },
      'noturno': { label: 'Noite', emoji: '🌙', color: 'bg-dark' },
      'integral': { label: 'Integral', emoji: '🌞', color: 'bg-success' }
    };
    
    return turnoMap[turno] || { label: turno, emoji: '⏰', color: 'bg-secondary' };
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

  if (loading) {
    console.log('Renderizando estado de loading...');
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando turmas...</p>
            <p className="text-muted">isReady: {isReady ? 'true' : 'false'}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Renderizando lista de turmas...');
  
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="list-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="list-page-title text-success">🏫 Lista de Turmas</h1>
              <p className="list-page-subtitle">
                {admin?.role === 'admin' 
                  ? 'Gerencie turmas base e turmas-disciplina do sistema escolar'
                  : 'Crie e gerencie suas turmas-disciplina'}
              </p>
              <div className="list-page-actions">
                <Link to="/home" className="list-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/turmas/disciplina/nova" className="list-page-btn btn btn-info me-2">
                  📚 Criar Turma-Disciplina
                </Link>
                {admin?.role === 'admin' && (
                  <Link to="/turmas/nova" className="list-page-btn btn btn-success">
                    ➕ Cadastrar Turma Base
                  </Link>
                )}
              </div>
              
              {/* Debug info */}
              <div className="alert alert-info mt-3">
                <strong>Debug:</strong> Turmas carregadas: {Array.isArray(turmas) ? turmas.length : 'NÃO É ARRAY'} | 
                Tipo: {typeof turmas} | 
                É Array: {Array.isArray(turmas) ? 'Sim' : 'Não'}
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
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="list-page-card">
              <div className="card-body">
                {!Array.isArray(turmas) || turmas.length === 0 ? (
                  <div className="list-page-empty">
                    <div className="list-page-empty-icon text-muted">🏫</div>
                    <h4 className="list-page-empty-title">
                      {!Array.isArray(turmas) ? 'Erro ao carregar turmas' : 'Nenhuma turma cadastrada'}
                    </h4>
                    <p className="list-page-empty-text">
                      {!Array.isArray(turmas) 
                        ? 'Ocorreu um erro ao processar os dados. Tente recarregar a página.' 
                        : 'Comece criando a primeira turma para organizar os alunos!'}
                    </p>
                    {Array.isArray(turmas) && (
                      <Link to="/turmas/nova" className="list-page-btn btn btn-success">
                        Cadastrar Primeira Turma
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="list-page-table table table-hover">
                      <thead className="table-success">
                        <tr>
                          <th>Nome da Turma</th>
                          <th>Tipo</th>
                          <th>Disciplina</th>
                          <th>Professor</th>
                          <th>Ano</th>
                          <th>Turno</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turmas.map((turma) => {
                          const turnoInfo = formatarTurno(turma.turno);
                          const ehDisciplina = turma.tipo === 'disciplina';
                          
                          return (
                            <tr key={turma.id} className={ehDisciplina ? 'table-info' : ''}>
                              <td className="fw-semibold">
                                {ehDisciplina && '└─ '}
                                {turma.nome}
                              </td>
                              <td>
                                <span className={`list-page-badge badge ${ehDisciplina ? 'bg-info' : 'bg-primary'}`}>
                                  {ehDisciplina ? '📚 Disciplina' : '🏫 Base'}
                                </span>
                              </td>
                              <td>
                                {turma.disciplina ? (
                                  <span className="badge bg-success">{turma.disciplina}</span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                {turma.professor_nome ? (
                                  <small>👨‍🏫 {turma.professor_nome}</small>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                <span className="list-page-badge badge bg-secondary">{turma.ano}</span>
                              </td>
                              <td>
                                <span className={`list-page-badge badge ${turnoInfo.color}`}>
                                  {turnoInfo.emoji} {turnoInfo.label}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="list-page-table-actions">
                                  <button
                                    onClick={() => navigate(`/turmas/${turma.id}`)}
                                    className="list-page-table-btn btn btn-outline-info btn-sm"
                                    title="Ver detalhes"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    onClick={() => navigate(`/turmas/${turma.id}/frequencia`)}
                                    className="list-page-table-btn btn btn-outline-success btn-sm"
                                    title="Frequência"
                                  >
                                    📊
                                  </button>
                                  {admin?.role === 'admin' && (
                                    <>
                                      <button
                                        onClick={() => navigate(`/turmas/editar/${turma.id}`)}
                                        className="list-page-table-btn btn btn-outline-warning btn-sm"
                                        title="Editar"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => excluirTurma(turma.id)}
                                        className="list-page-table-btn btn btn-outline-danger btn-sm"
                                        title="Excluir"
                                      >
                                        🗑️
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
