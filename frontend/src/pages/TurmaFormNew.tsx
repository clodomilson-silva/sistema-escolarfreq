import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./FormPages.css";

function TurmaForm() {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState<number | "">("");
  const [turno, setTurno] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica no frontend
    if (!nome || !ano || !turno) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post("/turmas/", {
        nome,
        ano: Number(ano),
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
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h1 className="h4 mb-0">🏫 Cadastrar Nova Turma</h1>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <Link to="/home" className="btn btn-outline-secondary btn-sm">
                    🏠 Voltar para Home
                  </Link>
                  <Link to="/turmas" className="btn btn-outline-success btn-sm ms-2">
                    🏫 Ver Lista de Turmas
                  </Link>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">
                      Nome da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ex: 1º Ano A, 2º Ano B, etc."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ano" className="form-label">
                      Ano Escolar: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="ano"
                      value={ano}
                      onChange={(e) => setAno(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione o ano</option>
                      <option value={1}>1º Ano</option>
                      <option value={2}>2º Ano</option>
                      <option value={3}>3º Ano</option>
                      <option value={4}>4º Ano</option>
                      <option value={5}>5º Ano</option>
                      <option value={6}>6º Ano</option>
                      <option value={7}>7º Ano</option>
                      <option value={8}>8º Ano</option>
                      <option value={9}>9º Ano</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="turno" className="form-label">
                      Turno: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="turno"
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="Manhã">🌅 Manhã</option>
                      <option value="Tarde">☀️ Tarde</option>
                      <option value="Noite">🌙 Noite</option>
                    </select>
                  </div>

                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg"
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
