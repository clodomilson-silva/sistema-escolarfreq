import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  criado_em?: string;
  atualizado_em?: string;
}

function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    carregarTurmas();
  }, []);

  const carregarTurmas = async () => {
    try {
      setLoading(true);
      console.log('Carregando turmas...');
      const response = await api.get("/turmas");
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
        await api.delete(`/turmas/${id}`);
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
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h2 text-success mb-3">🏫 Lista de Turmas</h1>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/home" className="btn btn-outline-secondary">
                🏠 Voltar para Home
              </Link>
              <Link to="/turmas/nova" className="btn btn-success">
                ➕ Cadastrar Nova Turma
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {turmas.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3">🏫</div>
                    <h4 className="text-muted">Nenhuma turma cadastrada</h4>
                    <p className="text-muted">Comece criando a primeira turma para organizar os alunos!</p>
                    <Link to="/turmas/nova" className="btn btn-success">
                      Cadastrar Primeira Turma
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-success">
                        <tr>
                          <th>Nome da Turma</th>
                          <th>Número</th>
                          <th>Turno</th>
                          <th>Data Criação</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turmas.map((turma) => (
                          <tr key={turma.id}>
                            <td className="fw-semibold">{turma.nome}</td>
                            <td>
                              <span className="badge bg-primary">{turma.ano}</span>
                            </td>
                            <td>
                              <span className={`badge ${formatarTurno(turma.turno).color}`}>
                                {formatarTurno(turma.turno).emoji} {formatarTurno(turma.turno).label}
                              </span>
                            </td>
                            <td>
                              {turma.criado_em ? 
                                (() => {
                                  try {
                                    const data = new Date(turma.criado_em);
                                    return data.toLocaleDateString('pt-BR');
                                  } catch {
                                    console.error('Erro ao formatar data:', turma.criado_em);
                                    return 'Data inválida';
                                  }
                                })() : 
                                '-'
                              }
                            </td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button
                                  onClick={() => navigate(`/turmas/${turma.id}`)}
                                  className="btn btn-outline-info btn-sm"
                                  title="Ver detalhes e gerenciar alunos"
                                >
                                  �
                                </button>
                                <button
                                  onClick={() => navigate(`/turmas/editar/${turma.id}`)}
                                  className="btn btn-outline-warning btn-sm"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => excluirTurma(turma.id)}
                                  className="btn btn-outline-danger btn-sm"
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
