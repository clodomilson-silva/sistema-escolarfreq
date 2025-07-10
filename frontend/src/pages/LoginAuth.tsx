import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginAuth() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  const { login, isAuthenticated } = useAuth();

  // Redirecionar se já estiver logado
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
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
      await login(email, senha);
      // Redirecionamento será automático devido ao Navigate acima
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container-xl login-container">
        <div className="row min-vh-100 align-items-center">
          {/* Coluna da esquerda - Informações do sistema (apenas em telas grandes) */}
          <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-center text-white px-5 login-info-section">
            <div className="mb-5">
              <h1 className="display-3 fw-bold mb-4 login-info-title">
                🏫 Sistema Escolar
              </h1>
              <p className="fs-3 mb-5 opacity-90">
                Plataforma completa para gestão educacional moderna e eficiente
              </p>
              <div className="row g-4 login-info-items">
                <div className="col-6">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <span style={{ fontSize: '1.5rem' }}>👥</span>
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Gestão de Alunos</h5>
                      <small className="opacity-75 fs-6">Cadastro e acompanhamento completo dos estudantes</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🏫</span>
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Gestão de Turmas</h5>
                      <small className="opacity-75 fs-6">Organização e controle acadêmico avançado</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🔐</span>
                    </div>
                    <div>
                      <h5 className="mb-1 fs-4">Acesso Seguro</h5>
                      <small className="opacity-75 fs-6">Autenticação JWT com criptografia robusta</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <span style={{ fontSize: '1.5rem' }}>📱</span>
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
          <div className="col-lg-5 col-md-8 col-sm-10 mx-auto">
            <div className="card shadow-lg border-0 login-card login-form-container" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4 p-lg-5 login-card-body">
                <div className="text-center mb-4 mb-lg-5">
                  <div className="mb-3">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                      🏫
                    </div>
                  </div>
                  <h1 className="h2 h-lg-1 text-dark fw-bold mb-2 login-title">Sistema Escolar</h1>
                  <p className="text-muted fs-5 fs-lg-4 login-subtitle">Acesso Administrativo</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {erro && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                      <strong>⚠️ Erro:</strong> {erro}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark fs-6 fs-lg-5">📧 Email:</label>
                    <input
                      type="email"
                      className="form-control form-control-lg login-input"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="admin@sistema-escolar.com"
                      style={{ 
                        borderRadius: '12px', 
                        padding: '16px 20px',
                        fontSize: '1.1rem',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="senha" className="form-label fw-semibold text-dark fs-6 fs-lg-5">🔒 Senha:</label>
                    <input
                      type="password"
                      className="form-control form-control-lg login-input"
                      id="senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Digite sua senha"
                      style={{ 
                        borderRadius: '12px', 
                        padding: '16px 20px',
                        fontSize: '1.1rem',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </div>

                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg py-3 fw-semibold fs-5 login-button"
                      disabled={loading}
                      style={{ 
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        border: 'none',
                        boxShadow: '0 6px 20px rgba(0, 123, 255, 0.3)',
                        fontSize: '1.2rem',
                        padding: '16px'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Entrando...
                        </>
                      ) : (
                        <>
                          🚀 Entrar no Sistema
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <div className="border-top pt-4">
                    <small className="text-muted d-block mb-3 fs-6">
                      🛡️ Apenas administradores podem acessar o sistema
                    </small>
                    <div className="bg-light rounded-3 p-3 p-lg-4">
                      <small className="text-dark fs-6">
                        <strong>💡 Credenciais de primeiro acesso:</strong><br />
                        <div className="mt-2 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2">
                          <div className="text-center">
                            <span className="fw-semibold">Email:</span> 
                            <code className="bg-white px-3 py-2 rounded ms-1 d-inline-block">admin@sistema-escolar.com</code>
                          </div>
                        </div>
                        <div className="mt-2 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-2">
                          <div className="text-center">
                            <span className="fw-semibold">Senha:</span> 
                            <code className="bg-white px-3 py-2 rounded ms-1 d-inline-block">Admin123!</code>
                          </div>
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
  );
}

export default LoginAuth;
