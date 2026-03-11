import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const { admin } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      <div className="container-fluid px-4 py-5">
        {/* Header */}
        <div className="page-header mb-5">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <i className="bi bi-grid-1x2" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <div>
              <h1 className="mb-1" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                Dashboard
              </h1>
              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Bem-vindo, <strong style={{ color: 'var(--primary-color)' }}>{admin?.nome || "Usuário"}</strong>
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginTop: '1.5rem'
          }}>
            <i className="bi bi-info-circle" style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}></i>
            <span style={{ color: 'var(--text-secondary)' }}>
              {admin?.role === 'admin' 
                ? 'Gerencie alunos, turmas e todo o sistema de forma eficiente.'
                : 'Gerencie suas turmas-disciplina e registre frequência dos alunos.'}
            </span>
          </div>
          
          {admin?.role === 'professor' && admin?.disciplinas && admin.disciplinas.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(13, 110, 253, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(13, 110, 253, 0.2)'
            }}>
              <strong style={{ color: 'var(--text-primary)', marginRight: '0.75rem' }}>
                Suas Disciplinas:
              </strong>
              {admin.disciplinas.map((d, i) => (
                <span 
                  key={i} 
                  className="badge me-2"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cards de Ação */}
        <div className="row g-4 mb-5">
          {admin?.role === 'admin' && (
            <div className="col-lg-6">
              <div
                className="stat-card h-100"
                onClick={() => navigate("/alunos")}
                style={{
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(13, 110, 253, 0.05) 100%)',
                  borderColor: 'rgba(13, 110, 253, 0.3)'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="stat-card-icon" style={{
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                    color: 'white'
                  }}>
                    <i className="bi bi-people"></i>
                  </div>
                  <span className="badge" style={{
                    backgroundColor: 'rgba(13, 110, 253, 0.15)',
                    color: 'var(--primary-color)',
                    border: '1px solid rgba(13, 110, 253, 0.3)',
                    padding: '0.5rem 0.75rem'
                  }}>
                    Gerenciamento
                  </span>
                </div>
                
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  Gerenciar Alunos
                </h3>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  Visualizar, adicionar e editar informações dos alunos matriculados no sistema
                </p>
                
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--primary-color)',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <i className="bi bi-plus-circle me-1"></i> Cadastro
                  </span>
                  <span className="badge" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--info-color)',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <i className="bi bi-list-ul me-1"></i> Listagem
                  </span>
                  <span className="badge" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--success-color)',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <i className="bi bi-pencil me-1"></i> Edição
                  </span>
                </div>
                
                <div className="mt-4">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/alunos");
                    }}
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Acessar Alunos
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={admin?.role === 'admin' ? 'col-lg-6' : 'col-lg-12'}>
            <div
              className="stat-card h-100"
              onClick={() => navigate("/turmas")}
              style={{
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(25, 135, 84, 0.05) 100%)',
                borderColor: 'rgba(25, 135, 84, 0.3)'
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="stat-card-icon" style={{
                  background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)',
                  color: 'white'
                }}>
                  <i className="bi bi-grid-3x3-gap"></i>
                </div>
                <span className="badge" style={{
                  backgroundColor: 'rgba(25, 135, 84, 0.15)',
                  color: 'var(--success-color)',
                  border: '1px solid rgba(25, 135, 84, 0.3)',
                  padding: '0.5rem 0.75rem'
                }}>
                  {admin?.role === 'admin' ? 'Administração' : 'Professor'}
                </span>
              </div>
              
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                {admin?.role === 'admin' ? 'Gerenciar Turmas' : 'Minhas Turmas-Disciplina'}
              </h3>
              
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {admin?.role === 'admin' 
                  ? 'Criar e organizar turmas base e turmas-disciplina para o ano letivo'
                  : 'Criar turmas-disciplina vinculadas e registrar frequência dos alunos'}
              </p>
              
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--success-color)',
                  padding: '0.4rem 0.75rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <i className="bi bi-calendar-check me-1"></i> Frequência
                </span>
                {admin?.role === 'admin' && (
                  <>
                    <span className="badge" style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--warning-color)',
                      padding: '0.4rem 0.75rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <i className="bi bi-gear me-1"></i> Gestão
                    </span>
                    <span className="badge" style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--info-color)',
                      padding: '0.4rem 0.75rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <i className="bi bi-diagram-3 me-1"></i> Organização
                    </span>
                  </>
                )}
                {admin?.role === 'professor' && (
                  <span className="badge" style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--info-color)',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <i className="bi bi-book me-1"></i> Disciplinas
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-success w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/turmas");
                  }}
                >
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  Acessar Turmas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Informativo */}
        <div className="row">
          <div className="col-12">
            <div style={{
              background: admin?.role === 'admin' 
                ? 'linear-gradient(135deg, rgba(13, 202, 240, 0.1) 0%, rgba(13, 202, 240, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
              border: `1px solid ${admin?.role === 'admin' ? 'rgba(13, 202, 240, 0.3)' : 'rgba(25, 135, 84, 0.3)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: admin?.role === 'admin' 
                  ? 'linear-gradient(135deg, #0dcaf0 0%, #0aa2c0 100%)'
                  : 'linear-gradient(135deg, #198754 0%, #146c43 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <i className={`bi ${admin?.role === 'admin' ? 'bi-shield-check' : 'bi-book'}`} 
                   style={{ fontSize: '1.75rem', color: 'white' }}></i>
              </div>
              
              <h4 style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {admin?.role === 'admin' ? 'Controle Total do Sistema' : 'Área do Professor'}
              </h4>
              
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {admin?.role === 'admin' 
                  ? 'Como administrador, você tem acesso completo ao sistema. Gerencie alunos, turmas base, professores e visualize todas as informações do PontoClass.'
                  : 'Como professor, você pode criar turmas-disciplina vinculadas às turmas base, registrar frequência dos alunos e lançar notas nas suas disciplinas.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
