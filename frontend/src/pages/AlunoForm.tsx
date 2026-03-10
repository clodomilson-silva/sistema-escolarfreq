import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./FormPages.css";

function AlunoForm() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica no frontend
    if (!nome || !matricula || !dataNascimento || !email) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }
    
    try {
      console.log('Dados enviados:', {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email,
      });
      
      const response = await api.post("/alunos/", {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email,
      });
      
      console.log('Resposta da API:', response.data);
      alert("Aluno cadastrado com sucesso!");
      
      // Limpar formulário
      setNome("");
      setMatricula("");
      setDataNascimento("");
      setEmail("");
      
      navigate("/alunos"); // Redireciona para a lista de alunos
    } catch (error: unknown) {
      console.error("Erro ao cadastrar aluno:", error);
      
      let mensagemErro = "Erro ao cadastrar aluno!";
      
      // Type guard para verificar se é um erro do Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; details?: string };
            status?: number;
          };
          request?: unknown;
        };
        
        if (axiosError.response) {
          // Erro da API
          if (axiosError.response.data?.message) {
            mensagemErro = axiosError.response.data.message;
          } else if (axiosError.response.data?.details) {
            mensagemErro = axiosError.response.data.details;
          } else if (axiosError.response.status === 400) {
            mensagemErro = "Dados inválidos ou já existentes!";
          } else if (axiosError.response.status === 500) {
            mensagemErro = "Erro interno do servidor!";
          }
        } else if (axiosError.request) {
          // Erro de conexão
          mensagemErro = "Erro de conexão com o servidor!";
        }
      }
      
      alert(mensagemErro);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="form-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="form-page-title text-primary">📝 Cadastrar Novo Aluno</h1>
              <p className="form-page-subtitle">Preencha os dados do novo aluno</p>
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
                      placeholder="Ex: 2024001"
                    />
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="dataNascimento" className="form-page-label">
                      Data de Nascimento: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-page-input"
                      id="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      required
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
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  <div className="form-page-form-actions">
                    <Link to="/alunos" className="form-page-cancel-btn">
                      ❌ Cancelar
                    </Link>
                    <button type="submit" className="form-page-submit-btn btn btn-primary">
                      ✅ Cadastrar Aluno
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

export default AlunoForm;
