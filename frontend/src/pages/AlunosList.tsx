import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./ListPages.css";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  data_nascimento: string;
  email: string;
}

interface Turma {
  id: string;
  nome: string;
  disciplina: string;
  tipo: 'base' | 'disciplina';
}

type AlunoDaTurma = { id: string } | string;

interface TurmaComAlunos extends Turma {
  alunos?: AlunoDaTurma[];
}

function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBoletimModal, setShowBoletimModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [turmasAluno, setTurmasAluno] = useState<Turma[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const navigate = useNavigate();
  const { isReady } = useAuth();

  useEffect(() => {
    if (isReady) {
      carregarAlunos();
    }
  }, [isReady]);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      console.log('Carregando alunos...');
      const response = await api.get("/alunos/");
      console.log('Resposta da API:', response.data);
      
      // A API retorna { success: true, data: [...], total: number }
      const alunos = response.data.data || response.data;
      setAlunos(alunos);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      
      let mensagem = "Erro ao carregar lista de alunos!";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
          request?: unknown;
        };
        
        if (axiosError.response?.data?.message) {
          mensagem = axiosError.response.data.message;
        } else if (axiosError.response?.status === 404) {
          mensagem = "Endpoint não encontrado!";
        } else if (axiosError.request) {
          mensagem = "Erro de conexão com o servidor!";
        }
      }
      
      alert(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const excluirAluno = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await api.delete(`/alunos/${id}/`);
        alert("Aluno excluído com sucesso!");
        carregarAlunos(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno!");
      }
    }
  };

  const abrirModalBoletim = async (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setShowBoletimModal(true);
    setLoadingTurmas(true);
    
    try {
      // Buscar todas as turmas e filtrar as que o aluno está matriculado
      const response = await api.get('/turmas/');
      const todasTurmas: TurmaComAlunos[] = response.data.data || response.data;
      
      // Filtrar turmas onde o aluno está matriculado
      const turmasDoAluno = todasTurmas.filter((turma) => {
        if (Array.isArray(turma.alunos)) {
          // Se alunos é array de objetos
          if (turma.alunos.length > 0 && typeof turma.alunos[0] === 'object') {
            return turma.alunos.some((a) => typeof a === 'object' && a.id === aluno.id);
          }
          // Se alunos é array de IDs (strings)
          return turma.alunos.includes(aluno.id);
        }
        return false;
      });
      
      // Priorizar turmas tipo disciplina
      const turmasDisciplina = turmasDoAluno.filter((t) => t.tipo === 'disciplina');
      setTurmasAluno(turmasDisciplina.length > 0 ? turmasDisciplina : turmasDoAluno);
    } catch (error) {
      console.error('Erro ao buscar turmas do aluno:', error);
      alert('Erro ao carregar turmas do aluno');
    } finally {
      setLoadingTurmas(false);
    }
  };

  const verBoletim = (turmaId: string) => {
    if (alunoSelecionado) {
      navigate(`/alunos/${alunoSelecionado.id}/boletim?turma_id=${turmaId}`);
    }
  };

  const imprimirBoletim = (turmaId: string) => {
    if (alunoSelecionado) {
      // Abre em nova aba e aciona impressão
      const url = `/alunos/${alunoSelecionado.id}/boletim?turma_id=${turmaId}&print=true`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-vh-100 alunos-list-page" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="page-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <i className="bi bi-people" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', margin: 0 }}>Lista de Alunos</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Gerencie todos os alunos matriculados no sistema</p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/home" className="btn btn-outline-secondary">
              <i className="bi bi-house-door me-2"></i>Voltar para Home
            </Link>
            <Link to="/alunos/novo" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Cadastrar Novo Aluno
            </Link>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card alunos-list-card">
              <div className="card-body">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Carregando alunos...</p>
                  </div>
                ) : alunos.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <i className="bi bi-book" style={{ fontSize: '4rem', color: 'var(--text-muted)' }}></i>
                    </div>
                    <h4 style={{ color: 'var(--text-primary)' }}>Nenhum aluno cadastrado</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Comece cadastrando o primeiro aluno!</p>
                    <Link to="/alunos/novo" className="btn btn-primary mt-3">
                      <i className="bi bi-plus-circle me-2"></i>Cadastrar Primeiro Aluno
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive alunos-list-table-wrapper">
                    <table className="table table-hover alunos-list-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Matrícula</th>
                          <th>Email</th>
                          <th>Data Nascimento</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map((aluno) => (
                          <tr key={aluno.id}>
                            <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{aluno.nome}</td>
                            <td>
                              <span className="badge" style={{ 
                                background: 'var(--info-color)', 
                                color: 'white',
                                padding: '0.35rem 0.75rem'
                              }}>{aluno.matricula}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{aluno.email}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                                  className="btn btn-sm btn-outline-info"
                                  title="Ver detalhes"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  onClick={() => abrirModalBoletim(aluno)}
                                  className="btn btn-sm btn-outline-success"
                                  title="Ver Boletim"
                                >
                                  <i className="bi bi-graph-up"></i>
                                </button>
                                <button
                                  onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                                  className="btn btn-sm btn-outline-warning"
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  onClick={() => excluirAluno(aluno.id)}
                                  className="btn btn-sm btn-outline-danger"
                                  title="Excluir"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Turma para Boletim */}
      {showBoletimModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowBoletimModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}>
              <div className="modal-header" style={{
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <h5 className="modal-title text-white">
                  <i className="bi bi-graph-up me-2"></i>Boletim de {alunoSelecionado?.nome}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowBoletimModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ background: 'var(--bg-card)' }}>
                {loadingTurmas ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Carregando turmas...</p>
                  </div>
                ) : turmasAluno.length === 0 ? (
                  <div className="alert" style={{
                    background: 'rgba(13, 110, 253, 0.1)',
                    border: '1px solid rgba(13, 110, 253, 0.2)',
                    color: 'var(--info-color)'
                  }}>
                    <i className="bi bi-info-circle me-2"></i>Aluno não está matriculado em nenhuma turma.
                  </div>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selecione a turma/disciplina para visualizar o boletim:</p>
                    <div className="list-group">
                      {turmasAluno.map((turma) => (
                        <div key={turma.id} className="list-group-item" style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          marginBottom: '0.5rem',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>{turma.nome}</h6>
                              <small style={{ color: 'var(--text-muted)' }}>Disciplina: {turma.disciplina}</small>
                            </div>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  verBoletim(turma.id);
                                  setShowBoletimModal(false);
                                }}
                                title="Ver Boletim"
                              >
                                <i className="bi bi-eye me-1"></i>Ver
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => {
                                  imprimirBoletim(turma.id);
                                  setShowBoletimModal(false);
                                }}
                                title="Imprimir/PDF"
                              >
                                <i className="bi bi-printer me-1"></i>PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBoletimModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlunosList;
