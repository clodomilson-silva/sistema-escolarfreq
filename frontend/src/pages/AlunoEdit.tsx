import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./FormPages.css";

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
  const { isReady } = useAuth();

  useEffect(() => {
    if (isReady && id) {
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

      carregarAluno();
    }
  }, [isReady, id]);

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
        <div className="form-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="form-page-title text-primary">✏️ Editar Aluno</h1>
              <p className="form-page-subtitle">Edite os dados do aluno selecionado</p>
              <div className="form-page-actions">
                <Link to="/home" className="form-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/alunos" className="form-page-btn btn btn-outline-info">
                  👥 Ver Lista de Alunos
                </Link>
              </div>
            </div>
          </div>
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
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="form-page-card">
              <div className="form-page-form">

                <form onSubmit={handleSubmit}>
                  <div className="form-page-form-group">
                    <label htmlFor="nome" className="form-page-label">
                      Nome Completo: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-page-input"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="Digite o nome completo do aluno"
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="matricula" className="form-page-label">
                      Matrícula: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-page-input"
                      id="matricula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="Ex: 2024001"
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="dataNascimento" className="form-page-label">
                      Data de Nascimento:
                    </label>
                    <input
                      type="date"
                      className="form-page-input"
                      id="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      disabled={loadingSubmit}
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="email" className="form-page-label">
                      Email: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-page-input"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  <div className="form-page-form-actions">
                    <Link to="/alunos" className="form-page-cancel-btn">
                      ❌ Cancelar
                    </Link>
                    <button type="submit" className="form-page-submit-btn btn btn-primary" disabled={loadingSubmit}>
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
