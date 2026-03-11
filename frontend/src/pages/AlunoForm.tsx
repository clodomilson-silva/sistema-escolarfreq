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
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
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
        telefone,
        endereco,
        responsavel,
        telefone_responsavel: telefoneResponsavel,
      });
      
      const response = await api.post("/alunos/", {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email,
        telefone,
        endereco,
        responsavel,
        telefone_responsavel: telefoneResponsavel,
      });
      
      console.log('Resposta da API:', response.data);
      alert("Aluno cadastrado com sucesso!");
      
      // Limpar formulário
      setNome("");
      setMatricula("");
      setDataNascimento("");
      setEmail("");
      setTelefone("");
      setEndereco("");
      setResponsavel("");
      setTelefoneResponsavel("");
      
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
              <i className="bi bi-person-plus" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', margin: 0 }}>Cadastrar Novo Aluno</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Preencha os dados do novo aluno</p>
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
                      placeholder="Ex: 2024001"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dataNascimento" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Data de Nascimento: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      required
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
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="telefone" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Telefone:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="responsavel" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Responsável:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="responsavel"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="telefoneResponsavel" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Telefone do Responsável:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="telefoneResponsavel"
                      value={telefoneResponsavel}
                      onChange={(e) => setTelefoneResponsavel(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="endereco" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Endereço:
                    </label>
                    <textarea
                      className="form-control"
                      id="endereco"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      rows={3}
                      placeholder="Rua, número, bairro, cidade..."
                    />
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <Link to="/alunos" className="btn btn-outline-secondary">
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>Cadastrar Aluno
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
