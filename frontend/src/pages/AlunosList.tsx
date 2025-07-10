import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  data_nascimento: string;
  email: string;
}

function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      console.log('Carregando alunos...');
      const response = await api.get("/alunos");
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
    }
  };

  const excluirAluno = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await api.delete(`/alunos/${id}`);
        alert("Aluno excluído com sucesso!");
        carregarAlunos(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno!");
      }
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h2 text-primary mb-3">👥 Lista de Alunos</h1>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/home" className="btn btn-outline-secondary">
                🏠 Voltar para Home
              </Link>
              <Link to="/alunos/novo" className="btn btn-primary">
                ➕ Cadastrar Novo Aluno
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {alunos.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3">📚</div>
                    <h4 className="text-muted">Nenhum aluno cadastrado</h4>
                    <p className="text-muted">Comece cadastrando o primeiro aluno!</p>
                    <Link to="/alunos/novo" className="btn btn-primary">
                      Cadastrar Primeiro Aluno
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
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
                              <span className="badge bg-info">{aluno.matricula}</span>
                            </td>
                            <td>{aluno.email}</td>
                            <td>{new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button
                                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                                  className="btn btn-outline-info btn-sm"
                                  title="Ver detalhes"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                                  className="btn btn-outline-warning btn-sm"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => excluirAluno(aluno.id)}
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

export default AlunosList;
