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
  const navigate = useNavigate();
  const { isReady, admin } = useAuth();

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
    if (isReady) {
      carregarTurmas();
    }
  }, [isReady]);

  const carregarTurmas = async () => {
    try {
      setLoading(true);
      console.log('Carregando turmas...');
      const response = await api.get("/turmas/");
      console.log('Resposta da API turmas:', response.data);
      
      // A API retorna { success: true, data: [...], total: number }
      const turmas = response.data.data || response.data;
      setTurmas(turmas);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      
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
      setLoading(false);
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
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando turmas...</p>
          </div>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="list-page-card">
              <div className="card-body">
                {turmas.length === 0 ? (
                  <div className="list-page-empty">
                    <div className="list-page-empty-icon text-muted">🏫</div>
                    <h4 className="list-page-empty-title">Nenhuma turma cadastrada</h4>
                    <p className="list-page-empty-text">Comece criando a primeira turma para organizar os alunos!</p>
                    <Link to="/turmas/nova" className="list-page-btn btn btn-success">
                      Cadastrar Primeira Turma
                    </Link>
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
