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
      const todasTurmas = response.data.data || response.data;
      
      // Filtrar turmas onde o aluno está matriculado
      const turmasDoAluno = todasTurmas.filter((turma: any) => {
        if (Array.isArray(turma.alunos)) {
          // Se alunos é array de objetos
          if (turma.alunos.length > 0 && typeof turma.alunos[0] === 'object') {
            return turma.alunos.some((a: any) => a.id === aluno.id);
          }
          // Se alunos é array de IDs (strings)
          return turma.alunos.includes(aluno.id);
        }
        return false;
      });
      
      // Priorizar turmas tipo disciplina
      const turmasDisciplina = turmasDoAluno.filter((t: any) => t.tipo === 'disciplina');
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
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="list-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="list-page-title text-primary">👥 Lista de Alunos</h1>
              <p className="list-page-subtitle">Gerencie todos os alunos matriculados no sistema</p>
              <div className="list-page-actions">
                <Link to="/home" className="list-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/alunos/novo" className="list-page-btn btn btn-primary">
                  ➕ Cadastrar Novo Aluno
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="list-page-card">
              <div className="card-body">
                {loading ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted fs-5">Carregando alunos...</p>
                  </div>
                ) : alunos.length === 0 ? (
                  <div className="list-page-empty">
                    <div className="list-page-empty-icon text-muted">📚</div>
                    <h4 className="list-page-empty-title">Nenhum aluno cadastrado</h4>
                    <p className="list-page-empty-text">Comece cadastrando o primeiro aluno!</p>
                    <Link to="/alunos/novo" className="list-page-btn btn btn-primary">
                      Cadastrar Primeiro Aluno
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="list-page-table table table-hover">
                      <thead className="table-primary">
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
                            <td className="fw-semibold">{aluno.nome}</td>
                            <td>
                              <span className="list-page-badge badge bg-info">{aluno.matricula}</span>
                            </td>
                            <td>{aluno.email}</td>
                            <td>{new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</td>
                            <td className="text-center">
                              <div className="list-page-table-actions">
                                <button
                                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                                  className="list-page-table-btn btn btn-outline-info btn-sm"
                                  title="Ver detalhes"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => abrirModalBoletim(aluno)}
                                  className="list-page-table-btn btn btn-outline-success btn-sm"
                                  title="Ver Boletim"
                                >
                                  📊
                                </button>
                                <button
                                  onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                                  className="list-page-table-btn btn btn-outline-warning btn-sm"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => excluirAluno(aluno.id)}
                                  className="list-page-table-btn btn btn-outline-danger btn-sm"
                                  title="Excluir"
                                >
                                  🗑️
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
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowBoletimModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">📊 Boletim de {alunoSelecionado?.nome}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowBoletimModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingTurmas ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2">Carregando turmas...</p>
                  </div>
                ) : turmasAluno.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i> Aluno não está matriculado em nenhuma turma.
                  </div>
                ) : (
                  <>
                    <p className="text-muted mb-3">Selecione a turma/disciplina para visualizar o boletim:</p>
                    <div className="list-group">
                      {turmasAluno.map((turma) => (
                        <div key={turma.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{turma.nome}</h6>
                              <small className="text-muted">Disciplina: {turma.disciplina}</small>
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
                                👁️ Ver
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => {
                                  imprimirBoletim(turma.id);
                                  setShowBoletimModal(false);
                                }}
                                title="Imprimir/PDF"
                              >
                                🖨️ PDF
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
