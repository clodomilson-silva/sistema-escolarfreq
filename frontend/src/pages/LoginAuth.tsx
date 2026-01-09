import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  FaSchool, 
  FaUsers, 
  FaLock, 
  FaMobileAlt, 
  FaChartLine,
  FaEnvelope,
  FaKey,
  FaSignInAlt,
  FaInfoCircle,
  FaLightbulb,
  FaExclamationTriangle
} from "react-icons/fa";
import "./LoginAuth.css";

function LoginAuth() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já está autenticado, redirecionar imediatamente
  if (isAuthenticated) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log('Tentando fazer login...');
      await login(email, senha);
      console.log('Login bem-sucedido, redirecionando...');
      // Forçar redirecionamento após login
      window.location.href = "/home";
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      if (error instanceof Error) {
        setErro(error.message);
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };
        setErro(axiosError.response?.data?.message || 'Erro ao conectar com o servidor');
        
        if (axiosError.response?.status === 404) {
          setErro('Servidor não encontrado. Verifique se o backend está rodando.');
        } else if (axiosError.response?.status === 401) {
          setErro('Email ou senha incorretos.');
        } else if (!axiosError.response) {
          setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
      } else {
        setErro("Erro ao fazer login. Tente novamente.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center login-compact" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
      <div className="container-xl login-container login-compact-container">
        <div className="row min-vh-100 align-items-center login-compact-row px-5">
          {/* Coluna da esquerda - Informações do sistema (apenas em telas grandes) */}
          <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-center text-white px-5 login-info-section login-compact-info">
            <div className="mb-5 login-compact-info-content">
              <h1 className="display-3 fw-bold mb-4 login-info-title text-center">
                <FaSchool className="me-3" /> Ponto Class
              </h1>
              <p className="fs-3 mb-5 opacity-90 text-center">
                Plataforma completa para gestão educacional moderna e eficiente
              </p>
              <div className="login-info-items-grid justify-content-between">
                <div className="col-10">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <FaUsers style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Gestão de Alunos</h5>
                      <small className="opacity-75 fs-6">Cadastro e acompanhamento completo dos estudantes</small>
                    </div>
                  </div>
                </div>
                <div className="col-10">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <FaChartLine style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Controle de Frequência</h5>
                      <small className="opacity-75 fs-6">Registro e análise de presença em tempo real</small>
                    </div>
                  </div>
                </div>
                <div className="col-10">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <FaLock style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Acesso Seguro</h5>
                      <small className="opacity-75 fs-6">Autenticação JWT com criptografia robusta</small>
                    </div>
                  </div>
                </div>
                <div className="col-10">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <FaMobileAlt style={{ fontSize: '1.5rem' }} />
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Interface Moderna</h5>
                      <small className="opacity-75 fs-6">Design responsivo para todas as telas</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da direita - Formulário de login */}
          <div className="col-lg-5 col-md-8 col-sm-10 mx-auto login-compact-form-wrapper">
            <div className="card shadow-lg border-0 login-card login-form-container login-compact-card" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4 p-lg-5 login-card-body login-compact-card-body">
                <div className="text-center mb-2 mb-lg-3">
                  <div className="mb-2">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
                      <FaSchool />
                    </div>
                  </div>
                  <h1 className="h3 text-dark fw-bold mb-2 login-title" style={{ fontSize: '1.5rem' }}>Ponto Class</h1>
                  <p className="text-muted small mb-0">Acesse sua conta</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {erro && (
                    <div className="alert alert-danger border-0 rounded-3 mb-3 d-flex align-items-center" role="alert">
                      <FaExclamationTriangle className="me-2" />
                      <div>
                        <strong>Erro:</strong> {erro}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold text-dark d-flex align-items-center">
                      <FaEnvelope className="me-2" /> Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaEnvelope className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg login-input border-start-0 ps-0"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="admin@sistema-escolar.com"
                        style={{ 
                          fontSize: '1rem',
                          border: '2px solid #e9ecef'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="senha" className="form-label fw-semibold text-dark d-flex align-items-center">
                      <FaKey className="me-2" /> Senha
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaKey className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control form-control-lg login-input border-start-0 ps-0"
                        id="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Digite sua senha"
                        style={{ 
                          fontSize: '1rem',
                          border: '2px solid #e9ecef'
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg py-3 fw-semibold login-button d-flex align-items-center justify-content-center"
                      disabled={loading}
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Entrando...
                        </>
                      ) : (
                        <>
                          <FaSignInAlt className="me-2" />
                          Entrar no Sistema
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-2">
                    Não tem uma conta?{' '}
                    <button 
                      onClick={() => window.location.href = '/registro'} 
                      className="btn btn-link text-primary fw-bold p-0"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                </div>

                <div className="text-center mt-3">
                  <button className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center justify-content-center mx-auto" type="button" data-bs-toggle="collapse" data-bs-target="#infoLogin" aria-expanded="false" aria-controls="infoLogin">
                    <FaInfoCircle className="me-2" />
                    <small>Informações de acesso</small>
                  </button>
                  <div className="collapse" id="infoLogin">
                    <div className="pt-2 border-top mt-2">
                      <p className="text-muted small mb-2"><FaLock className="me-1" /> Acesso Administrativo</p>
                      <small className="text-muted d-block mb-2">
                        Apenas administradores podem acessar o sistema
                      </small>
                      <button className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center justify-content-center mx-auto" type="button" data-bs-toggle="collapse" data-bs-target="#credenciaisLogin" aria-expanded="false" aria-controls="credenciaisLogin">
                        <FaLightbulb className="me-2" />
                        <small>Credenciais de primeiro acesso</small>
                      </button>
                      <div className="collapse" id="credenciaisLogin">
                        <div className="bg-light rounded-3 p-3 mt-2">
                          <small className="text-dark">
                            <strong className="d-flex align-items-center justify-content-center mb-2">
                              <FaLightbulb className="me-2" /> Credenciais padrão:
                            </strong>
                            <div className="login-credencial-row justify-content-center">
                              <span className="fw-semibold">Email:</span>
                              <code className="bg-white px-2 py-1 rounded ms-2">admin@sistema-escolar.com</code>
                            </div>
                            <div className="login-credencial-row justify-content-center">
                              <span className="fw-semibold">Senha:</span>
                              <code className="bg-white px-2 py-1 rounded ms-2">Admin123!</code>
                            </div>
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAuth;
