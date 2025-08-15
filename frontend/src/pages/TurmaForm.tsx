import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./FormPages.css";

function TurmaForm() {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isReady } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica no frontend
    if (!nome || !ano || !turno) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post("/turmas", {
        nome,
        ano: ano,
        turno,
      });
      
      console.log('Turma cadastrada:', response.data);
      alert("Turma cadastrada com sucesso!");
      
      // Limpar formulário
      setNome("");
      setAno("");
      setTurno("");
      
      navigate("/turmas");
    } catch (error) {
      console.error("Erro ao cadastrar turma:", error);
      
      let mensagemErro = "Erro ao cadastrar turma!";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; details?: string };
            status?: number;
          };
          request?: unknown;
        };
        
        if (axiosError.response) {
          if (axiosError.response.data?.message) {
            mensagemErro = axiosError.response.data.message;
          } else if (axiosError.response.data?.details) {
            mensagemErro = axiosError.response.data.details;
          } else if (axiosError.response.status === 400) {
            mensagemErro = "Dados inválidos ou turma já existe!";
          } else if (axiosError.response.status === 500) {
            mensagemErro = "Erro interno do servidor!";
          }
        } else if (axiosError.request) {
          mensagemErro = "Erro de conexão com o servidor!";
        }
      }
      
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="form-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="form-page-title text-success">🏫 Cadastrar Nova Turma</h1>
              <p className="form-page-subtitle">Preencha os dados da nova turma</p>
              <div className="form-page-actions">
                <Link to="/home" className="form-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/turmas" className="form-page-btn btn btn-outline-success">
                  🏫 Ver Lista de Turmas
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="form-page-card">
              <div className="form-page-form">

                <form onSubmit={handleSubmit}>
                  <div className="form-page-form-group">
                    <label htmlFor="nome" className="form-page-label">
                      Nome da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-page-input"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ex: 1º Ano A, 2º Ano B, etc."
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="ano" className="form-page-label">
                      Número da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-page-input"
                      id="ano"
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ex: 101, 201.1, 301.A, 1º ano..."
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="turno" className="form-page-label">
                      Turno: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-page-select"
                      id="turno"
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="matutino">🌅 Manhã (Matutino)</option>
                      <option value="vespertino">☀️ Tarde (Vespertino)</option>
                      <option value="noturno">🌙 Noite (Noturno)</option>
                      <option value="integral">🌞 Integral</option>
                    </select>
                  </div>

                  <div className="form-page-form-actions">
                    <Link to="/turmas" className="form-page-cancel-btn">
                      ❌ Cancelar
                    </Link>
                    <button 
                      type="submit" 
                      className="form-page-submit-btn btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cadastrando...
                        </>
                      ) : (
                        "✅ Cadastrar Turma"
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

export default TurmaForm;
