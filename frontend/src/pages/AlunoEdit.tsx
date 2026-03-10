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
          const response = await api.get(`/alunos/${id}/`);
          
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
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
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
              <i className="bi bi-pencil" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', margin: 0 }}>Editar Aluno</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Edite os dados do aluno selecionado</p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/home" className="btn btn-outline-secondary">
              <i className="bi bi-house-door me-2"></i>Voltar para Home
            </Link>
            <Link to="/alunos" className="btn btn-outline-info">
              <i className="bi bi-people me-2"></i>Ver Lista de Alunos
            </Link>
          </div>
        </div>

        {/* Alertas */}
        {erro && (
          <div className="alert" style={{
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            color: 'var(--danger-color)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }} role="alert">
            <i className="bi bi-x-circle me-2"></i><strong>Erro:</strong> {erro}
          </div>
        )}

        {sucesso && (
          <div className="alert" style={{
            background: 'rgba(25, 135, 84, 0.1)',
            border: '1px solid rgba(25, 135, 84, 0.2)',
            color: 'var(--success-color)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }} role="alert">
            <i className="bi bi-check-circle me-2"></i><strong>Sucesso:</strong> {sucesso}
          </div>
        )}
        
        <div className="row justify-content-center mt-4">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body p-4">

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Nome Completo: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="Digite o nome completo do aluno"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="matricula" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Matrícula: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="matricula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="Ex: 2024001"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dataNascimento" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Data de Nascimento:
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      disabled={loadingSubmit}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Email: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loadingSubmit}
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <Link to="/alunos" className="btn btn-outline-secondary">
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loadingSubmit}>
                      {loadingSubmit ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>Salvar Alterações
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
