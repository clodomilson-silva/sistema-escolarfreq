import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./ListPages.css";

interface Turma {
  id: string;
  nome: string;
  ano: number;
  turno: string;
  nivel_ensino?: 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante';
  criado_em?: string;
  atualizado_em?: string;
}

const formatarNivelEnsino = (nivel?: string) => {
  const niveis: Record<string, string> = {
    fundamental: 'Fundamental',
    medio: 'Medio',
    tecnico: 'Tecnico',
    profissionalizante: 'Profissionalizante'
  };

  return niveis[nivel || ''] || 'Nao informado';
};

function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtroNivelEnsino, setFiltroNivelEnsino] = useState<'todos' | 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante'>('todos');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isReady } = useAuth();

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

  const turmasFiltradas = turmas.filter((turma) => {
    if (filtroNivelEnsino === 'todos') {
      return true;
    }
    return turma.nivel_ensino === filtroNivelEnsino;
  });

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="text-center py-5">
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
              <p className="list-page-subtitle">Gerencie todas as turmas do sistema</p>
              <div className="list-page-actions">
                <Link to="/home" className="list-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/turmas/nova" className="list-page-btn btn btn-success">
                  ➕ Cadastrar Nova Turma
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="list-page-card">
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

                {turmas.length === 0 ? (
                  <div className="list-page-empty">
                    <div className="list-page-empty-icon text-muted">🏫</div>
                    <h4 className="list-page-empty-title">Nenhuma turma cadastrada</h4>
                    <p className="list-page-empty-text">Comece criando a primeira turma para organizar os alunos!</p>
                    <Link to="/turmas/nova" className="list-page-btn btn btn-success">
                      Cadastrar Primeira Turma
                    </Link>
                  </div>
                ) : turmasFiltradas.length === 0 ? (
                  <div className="list-page-empty">
                    <div className="list-page-empty-icon text-muted">🔎</div>
                    <h4 className="list-page-empty-title">Nenhuma turma para o filtro selecionado</h4>
                    <p className="list-page-empty-text">Selecione outro nivel de ensino para visualizar mais turmas.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="list-page-table table table-hover">
                      <thead className="table-success">
                        <tr>
                          <th>Nome da Turma</th>
                          <th>Ano</th>
                          <th>Nivel de Ensino</th>
                          <th>Turno</th>
                          <th>Data Criação</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turmasFiltradas.map((turma) => (
                          <tr key={turma.id}>
                            <td className="fw-semibold">{turma.nome}</td>
                            <td>
                              <span className="list-page-badge badge bg-primary">{turma.ano}º Ano</span>
                            </td>
                            <td>
                              <span className="list-page-badge badge bg-secondary">{formatarNivelEnsino(turma.nivel_ensino)}</span>
                            </td>
                            <td>
                              <span className={`list-page-badge badge ${
                                turma.turno === 'Manhã' ? 'bg-warning' : 
                                turma.turno === 'Tarde' ? 'bg-info' : 'bg-dark'
                              }`}>
                                {turma.turno}
                              </span>
                            </td>
                            <td>
                              {turma.criado_em ? 
                                new Date(turma.criado_em).toLocaleDateString('pt-BR') : 
                                '-'
                              }
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
    </div>
  );
}

export default TurmasList;
