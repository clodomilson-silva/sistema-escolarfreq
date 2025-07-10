import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  dataNascimento: string;
  endereco?: string;
  telefone?: string;
  criado_em?: { _seconds: number; _nanoseconds: number } | string;
  atualizado_em?: { _seconds: number; _nanoseconds: number } | string;
}

function AlunoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const buscarAluno = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/alunos/${id}`);
        
        if (response.data.success) {
          setAluno(response.data.data);
        } else {
          setErro("Aluno não encontrado");
        }
      } catch (error: unknown) {
        console.error("Erro ao buscar aluno:", error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Erro ao carregar dados do aluno";
        setErro(errorMessage || "Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarAluno();
    }
  }, [id]);

  const formatarData = (data: { _seconds: number; _nanoseconds: number } | string | undefined) => {
    if (!data) return "Não informado";
    
    try {
      // Se for um timestamp do Firebase
      if (typeof data === 'object' && '_seconds' in data) {
        return new Date(data._seconds * 1000).toLocaleDateString('pt-BR');
      }
      // Se for uma string de data
      if (typeof data === 'string') {
        return new Date(data).toLocaleDateString('pt-BR');
      }
      return "Data inválida";
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3 text-muted fs-5">Carregando dados do aluno...</p>
          </div>
        </div>
      </>
    );
  }

  if (erro || !aluno) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <h4>❌ Erro</h4>
                <p>{erro || "Aluno não encontrado"}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate("/alunos")}
                >
                  🔙 Voltar para Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2 mb-0">
                <span className="text-primary">👤</span> Detalhes do Aluno
              </h1>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate("/alunos")}
              >
                🔙 Voltar
              </button>
            </div>

            {/* Card Principal */}
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-primary text-white text-center py-4" style={{ borderRadius: '20px 20px 0 0' }}>
                <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle mb-3" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  👨‍🎓
                </div>
                <h3 className="mb-1">{aluno.nome}</h3>
                <p className="mb-0 fs-5">Matrícula: {aluno.matricula}</p>
              </div>

              <div className="card-body p-5">
                <div className="row g-4">
                  {/* Informações Pessoais */}
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">📋 Informações Pessoais</h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">📧 Email:</label>
                      <div className="p-2 bg-light rounded">
                        {aluno.email || "Não informado"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">🎂 Data de Nascimento:</label>
                      <div className="p-2 bg-light rounded">
                        {aluno.dataNascimento ? formatarData(aluno.dataNascimento) : "Não informado"}
                      </div>
                    </div>

                    {aluno.telefone && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">📞 Telefone:</label>
                        <div className="p-2 bg-light rounded">
                          {aluno.telefone}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações Adicionais */}
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">🏠 Informações Adicionais</h5>
                    
                    {aluno.endereco && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">📍 Endereço:</label>
                        <div className="p-2 bg-light rounded">
                          {aluno.endereco}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">📅 Cadastrado em:</label>
                      <div className="p-2 bg-light rounded">
                        {formatarData(aluno.criado_em)}
                      </div>
                    </div>

                    {aluno.atualizado_em && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">✏️ Última atualização:</label>
                        <div className="p-2 bg-light rounded">
                          {formatarData(aluno.atualizado_em)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-center">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                        style={{ borderRadius: '12px' }}
                      >
                        ✏️ Editar Aluno
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate("/alunos")}
                        style={{ borderRadius: '12px' }}
                      >
                        📋 Ver Todos os Alunos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AlunoDetalhes;
