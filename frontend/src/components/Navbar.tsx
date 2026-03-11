import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      padding: '1rem 0'
    }}>
      <div className="container-fluid px-4">
        <a 
          className="navbar-brand fw-bold d-flex align-items-center gap-2" 
          href="/home"
          style={{ 
            color: 'var(--text-primary)',
            fontSize: '1.25rem',
            letterSpacing: '-0.025em'
          }}
        >
          <i className="bi bi-book" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
          <span>PontoClass</span>
        </a>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{ 
            color: 'var(--text-primary)'
          }}
        >
          <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-4">
            <li className="nav-item">
              <a 
                className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded" 
                href="/home"
                style={{ 
                  color: isActive('/home') ? 'var(--primary-color)' : 'var(--text-secondary)',
                  backgroundColor: isActive('/home') ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
                  fontWeight: isActive('/home') ? '500' : '400',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-house-door"></i>
                <span>Dashboard</span>
              </a>
            </li>
            {admin?.role === 'admin' && (
              <li className="nav-item">
                <a 
                  className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded" 
                  href="/alunos"
                  style={{ 
                    color: isActive('/alunos') ? 'var(--primary-color)' : 'var(--text-secondary)',
                    backgroundColor: isActive('/alunos') ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
                    fontWeight: isActive('/alunos') ? '500' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="bi bi-people"></i>
                  <span>Alunos</span>
                </a>
              </li>
            )}
            <li className="nav-item">
              <a 
                className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded" 
                href="/turmas"
                style={{ 
                  color: isActive('/turmas') ? 'var(--primary-color)' : 'var(--text-secondary)',
                  backgroundColor: isActive('/turmas') ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
                  fontWeight: isActive('/turmas') ? '500' : '400',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-grid-3x3-gap"></i>
                <span>Turmas</span>
              </a>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span 
                className="badge d-flex align-items-center gap-1" 
                style={{ 
                  backgroundColor: admin?.role === 'admin' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(25, 135, 84, 0.15)',
                  color: admin?.role === 'admin' ? '#ffc107' : '#198754',
                  border: `1px solid ${admin?.role === 'admin' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(25, 135, 84, 0.3)'}`,
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: '500'
                }}
              >
                <i className={`bi ${admin?.role === 'admin' ? 'bi-shield-check' : 'bi-person-badge'}`}></i>
                {admin?.role === 'admin' ? 'Administrador' : 'Professor'}
              </span>
            </div>
            
            <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-2 rounded" style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <i className="bi bi-person-circle" style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}></i>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {admin?.nome || 'Usuário'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
