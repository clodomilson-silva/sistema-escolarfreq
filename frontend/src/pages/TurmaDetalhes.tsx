import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import FrequenciaForm from "./FrequenciaForm";

interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  alunos: string[];
  criado_em?: string;
  atualizado_em?: string;
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  data_nascimento: string;
}

function TurmaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [showFrequenciaForm, setShowFrequenciaForm] = useState(false);

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
    if (id) {
      carregarDados();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar turma e todos os alunos em paralelo
      const [turmaResponse, alunosResponse] = await Promise.all([
        api.get(`/turmas/${id}`),
        api.get('/alunos')
      ]);

      const turmaData = turmaResponse.data.data;
      const todosAlunosData = alunosResponse.data.data || alunosResponse.data;

      setTurma(turmaData);

      // Filtrar alunos da turma e disponíveis
      const alunosIds = turmaData.alunos || [];
      const alunosDaTurmaFiltrados = todosAlunosData.filter((aluno: Aluno) => 
        alunosIds.includes(aluno.id)
      );
      const alunosDisponiveisFiltrados = todosAlunosData.filter((aluno: Aluno) => 
        !alunosIds.includes(aluno.id)
      );

      setAlunosDaTurma(alunosDaTurmaFiltrados);
      setAlunosDisponiveis(alunosDisponiveisFiltrados);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da turma!");
    } finally {
      setLoading(false);
    }
  };

  const adicionarAluno = async (alunoId: string) => {
    try {
      setLoadingAlunos(true);
      await api.post(`/turmas/${id}/alunos/${alunoId}`);
      await carregarDados(); // Recarregar dados
      alert("Aluno adicionado à turma com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      alert("Erro ao adicionar aluno à turma!");
    } finally {
      setLoadingAlunos(false);
    }
  };

  const removerAluno = async (alunoId: string) => {
    if (window.confirm("Tem certeza que deseja remover este aluno da turma?")) {
      try {
        setLoadingAlunos(true);
        await api.delete(`/turmas/${id}/alunos/${alunoId}`);
        await carregarDados(); // Recarregar dados
        alert("Aluno removido da turma com sucesso!");
      } catch (error) {
        console.error("Erro ao remover aluno:", error);
        alert("Erro ao remover aluno da turma!");
      } finally {
        setLoadingAlunos(false);
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
            <p className="mt-2">Carregando dados da turma...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="alert alert-danger">
            <h4>Turma não encontrada</h4>
            <p>A turma solicitada não foi encontrada.</p>
            <Link to="/turmas" className="btn btn-primary">
              Voltar para Lista de Turmas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const turnoInfo = formatarTurno(turma.turno);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h2 text-success mb-0">🏫 Detalhes da Turma</h1>
              <Link to="/turmas" className="btn btn-outline-secondary">
                🔙 Voltar para Lista
              </Link>
            </div>
          </div>
        </div>

        {/* Informações da Turma */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-success text-white">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      🏫
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1">{turma.nome}</h3>
                    <p className="mb-0">Informações detalhadas da turma</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-md-3 text-center">
                    <strong>🔢 Número da Turma:</strong>
                    <br />
                    <span className="badge bg-primary fs-6">{turma.ano}</span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong>⏰ Turno:</strong>
                    <br />
                    <span className={`badge ${turnoInfo.color} fs-6`}>
                      {turnoInfo.emoji} {turnoInfo.label}
                    </span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong>👥 Total de Alunos:</strong>
                    <br />
                    <span className="badge bg-info fs-6">{alunosDaTurma.length} aluno(s)</span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong>📅 Criada em:</strong>
                    <br />
                    <span className="text-muted">
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
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Alunos da Turma */}
          <div className="col mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">👥 Alunos Matriculados ({alunosDaTurma.length})</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {alunosDaTurma.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">🤷‍♂️ Nenhum aluno matriculado nesta turma</p>
                    <small className="text-muted">Adicione alunos usando a lista ao lado</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {alunosDaTurma.map((aluno) => (
                      <div key={aluno.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{aluno.nome}</h6>
                          <small className="text-muted">
                            📋 {aluno.matricula} • 📧 {aluno.email}
                          </small>
                        </div>
                        <button
                          onClick={() => removerAluno(aluno.id)}
                          className="btn btn-outline-danger btn-sm"
                          disabled={loadingAlunos}
                          title="Remover da turma"
                        >
                          {loadingAlunos ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            "🗑️"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alunos Disponíveis */}
          <div className="col mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">➕ Adicionar Alunos ({alunosDisponiveis.length})</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {alunosDisponiveis.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">✅ Todos os alunos já estão matriculados</p>
                    <small className="text-muted">Ou não há alunos cadastrados no sistema</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {alunosDisponiveis.map((aluno) => (
                      <div key={aluno.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{aluno.nome}</h6>
                          <small className="text-muted">
                            📋 {aluno.matricula} • 📧 {aluno.email}
                          </small>
                        </div>
                        <button
                          onClick={() => adicionarAluno(aluno.id)}
                          className="btn btn-outline-success btn-sm"
                          disabled={loadingAlunos}
                          title="Adicionar à turma"
                        >
                          {loadingAlunos ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            "➕"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="row">
          <div className="col-12">
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button 
                className="btn btn-success"
                onClick={() => setShowFrequenciaForm(true)}
                disabled={alunosDaTurma.length === 0}
              >
                📊 Registrar Frequência
              </button>
              <Link 
                to={`/turmas/${id}/frequencia`} 
                className="btn btn-info"
              >
                📈 Dashboard de Frequência
              </Link>
              <Link 
                to={`/turmas/${id}/edit`} 
                className="btn btn-warning"
              >
                ✏️ Editar Turma
              </Link>
              <Link 
                to="/turmas" 
                className="btn btn-outline-secondary"
              >
                📋 Lista de Turmas
              </Link>
              <Link 
                to="/alunos/novo" 
                className="btn btn-outline-primary"
              >
                👤 Cadastrar Novo Aluno
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Frequência */}
      {showFrequenciaForm && (
        <FrequenciaForm
          turmaId={id!}
          alunos={alunosDaTurma.map(aluno => ({
            id: aluno.id,
            nome: aluno.nome,
            ra: aluno.matricula
          }))}
          onClose={() => setShowFrequenciaForm(false)}
        />
      )}
    </div>
  );
}

export default TurmaDetalhes;
