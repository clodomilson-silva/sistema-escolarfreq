import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginAuth() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  
  const { login, isAuthenticated, admin } = useAuth();
  const navigate = useNavigate();

  // Se já está autenticado, redirecionar imediatamente
  useEffect(() => {
    if (isAuthenticated) {
      const rotaDestino = admin?.role === 'admin' || admin?.role === 'supervisor' ? '/home' : '/turmas';
      navigate(rotaDestino, { replace: true });
    }
  }, [isAuthenticated, admin, navigate]);

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
      const user = await login(email, senha);
      console.log('Login bem-sucedido, redirecionando...');
      const rotaDestino = user.role === 'admin' || user.role === 'supervisor' ? '/home' : '/turmas';
      navigate(rotaDestino, { replace: true });
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '2rem 1rem'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          {/* Card Principal */}
          <div className="col-lg-10 col-xl-9">
            <div className="card" style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <div className="row g-0">
                {/* Painel Esquerdo - Informações */}
                <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                  color: 'white'
                }}>
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <i className="bi bi-book" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                          PontoClass
                        </h1>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                          Gestão Educacional Moderna
                        </p>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '1.1rem', opacity: 0.95, lineHeight: '1.6', marginBottom: '3rem' }}>
                      Plataforma completa para gestão de alunos, turmas, frequência e notas
                    </p>
                  </div>

                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex align-items-start gap-3">
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-people" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <h5 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Gestão de Alunos</h5>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem' }}>
                          Cadastro completo e acompanhamento individual
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-calendar-check" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <h5 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Controle de Frequência</h5>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem' }}>
                          Registro e análise de presença em tempo real
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-journal-check" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <h5 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Sistema de Notas</h5>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem' }}>
                          Lançamento de notas e geração de boletins
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-shield-check" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <h5 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Segurança</h5>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem' }}>
                          Autenticação JWT e controle de acesso por perfil
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Painel Direito - Formulário */}
                <div className="col-lg-6 p-4 p-lg-5" style={{
                  backgroundColor: 'var(--bg-card)'
                }}>
                  <div className="text-center mb-4">
                    <div className="d-lg-none mb-4">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="bi bi-book" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                          PontoClass
                        </h2>
                      </div>
                    </div>
                    
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      Bem-vindo de volta
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                      Entre com suas credenciais para acessar o sistema
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {erro && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <div>
                          <strong>Erro:</strong> {erro}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label d-flex align-items-center gap-2">
                        <i className="bi bi-envelope"></i>
                        <span>Email</span>
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="seu@email.com"
                        style={{ fontSize: '1rem' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="senha" className="form-label d-flex align-items-center gap-2">
                        <i className="bi bi-key"></i>
                        <span>Senha</span>
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Digite sua senha"
                        style={{ fontSize: '1rem' }}
                      />
                    </div>

                    <div className="d-grid mb-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{
                          padding: '0.875rem',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Entrando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Entrar no Sistema
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Cadastro de usuarios desabilitado por seguranca. Solicite acesso ao administrador do sistema.
                      </p>
                    </div>

                    <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

                    <div className="text-center">
                      <button 
                        type="button"
                        className="btn btn-link d-flex align-items-center justify-content-center gap-2 mx-auto p-0"
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}
                      >
                        <i className={`bi bi-chevron-${showInfo ? 'up' : 'down'}`}></i>
                        Informações de acesso
                      </button>
                      
                      {showInfo && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'left'
                        }}>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-info-circle" style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}></i>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              Credenciais de Primeiro Acesso
                            </strong>
                          </div>
                          
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <div className="mb-2">
                              <strong>Email:</strong>
                              <code style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--primary-color)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                marginLeft: '0.5rem',
                                fontSize: '0.85rem'
                              }}>
                                admin@escola.com
                              </code>
                            </div>
                            <div>
                              <strong>Senha:</strong>
                              <code style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--primary-color)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                marginLeft: '0.5rem',
                                fontSize: '0.85rem'
                              }}>
                                admin123
                              </code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
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
