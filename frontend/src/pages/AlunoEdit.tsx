import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AlunoEdit() {
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const carregarAluno = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/alunos/${id}`);
        
        if (response.data.success) {
          const aluno = response.data.data;
          setNome(aluno.nome || "");
          setMatricula(aluno.matricula || "");
          setDataNascimento(aluno.data_nascimento || "");
          setEmail(aluno.email || "");
        } else {
          setErro("Aluno não encontrado");
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar aluno:", error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Erro ao carregar dados do aluno";
        setErro(errorMessage || "Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarAluno();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !matricula || !email) {
      setErro("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoadingSubmit(true);
    setErro("");
    setSucesso("");

    try {
      const response = await api.put(`/alunos/${id}`, {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email
      });

      if (response.data.success) {
        setSucesso("Aluno atualizado com sucesso!");
        setTimeout(() => {
          navigate("/alunos");
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Erro ao atualizar aluno:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Erro ao atualizar aluno";
      setErro(errorMessage || "Erro ao atualizar aluno");
    } finally {
      setLoadingSubmit(false);
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

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2 mb-0">
                <span className="text-primary">✏️</span> Editar Aluno
              </h1>
              <Link 
                to="/alunos"
                className="btn btn-outline-secondary"
              >
                🔙 Voltar para Lista
              </Link>
            </div>

            {/* Alertas */}
            {erro && (
              <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                <strong>❌ Erro:</strong> {erro}
              </div>
            )}

            {sucesso && (
              <div className="alert alert-success border-0 rounded-3 mb-4" role="alert">
                <strong>✅ Sucesso:</strong> {sucesso}
              </div>
            )}

            {/* Formulário */}
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-primary text-white text-center py-4" style={{ borderRadius: '20px 20px 0 0' }}>
                <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle mb-3" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  👨‍🎓
                </div>
                <h3 className="mb-1">Atualizar Informações</h3>
                <p className="mb-0">Edite os dados do aluno abaixo</p>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Informações Básicas */}
                    <div className="col-12">
                      <h5 className="text-primary mb-3">📋 Informações Básicas</h5>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="nome" className="form-label fw-semibold">
                        👤 Nome Completo: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        disabled={loadingSubmit}
                        placeholder="Digite o nome completo"
                        style={{ borderRadius: '12px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="matricula" className="form-label fw-semibold">
                        🎫 Matrícula: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="matricula"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        required
                        disabled={loadingSubmit}
                        placeholder="Ex: 2024001"
                        style={{ borderRadius: '12px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label fw-semibold">
                        📧 Email: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loadingSubmit}
                        placeholder="exemplo@email.com"
                        style={{ borderRadius: '12px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="dataNascimento" className="form-label fw-semibold">
                        🎂 Data de Nascimento:
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        id="dataNascimento"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        disabled={loadingSubmit}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>

                    {/* Observação sobre campos obrigatórios */}
                    <div className="col-12">
                      <small className="text-muted">
                        <span className="text-danger">*</span> Campos obrigatórios
                      </small>
                    </div>

                    {/* Botões de Ação */}
                    <div className="col-12 mt-5">
                      <div className="d-flex gap-3 justify-content-center">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg px-5"
                          disabled={loadingSubmit}
                          style={{ borderRadius: '12px' }}
                        >
                          {loadingSubmit ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Salvando...
                            </>
                          ) : (
                            <>
                              💾 Salvar Alterações
                            </>
                          )}
                        </button>
                        
                        <Link
                          to={`/alunos/${id}`}
                          className="btn btn-outline-info btn-lg px-5"
                          style={{ borderRadius: '12px' }}
                        >
                          👁️ Visualizar Aluno
                        </Link>
                        
                        <Link
                          to="/alunos"
                          className="btn btn-outline-secondary btn-lg px-5"
                          style={{ borderRadius: '12px' }}
                        >
                          ❌ Cancelar
                        </Link>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlunoEdit;
