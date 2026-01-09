import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{
      backgroundColor: 'var(--primary-color)',
      boxShadow: 'var(--shadow-md)',
      padding: 'var(--spacing-md) 0'
    }}>
      <div className="container">
        <a className="navbar-brand fw-bold d-flex align-items-center" 
           href="/home"
           style={{ color: 'white' }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🏫</span>
          Sistema Escolar
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{ 
            border: '1px solid rgba(255,255,255,0.5)',
            padding: 'var(--spacing-xs)'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link px-3" href="/home" style={{ color: 'white' }}>
                🏠 Home
              </a>
            </li>
            {admin?.role === 'admin' && (
              <li className="nav-item">
                <a className="nav-link px-3" href="/alunos" style={{ color: 'white' }}>
                  👥 Alunos
                </a>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link px-3" href="/turmas" style={{ color: 'white' }}>
                🏫 Turmas
              </a>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <span style={{ color: 'rgba(255,255,255,0.9)', marginRight: 'var(--spacing-sm)' }}>
              <small className="badge" style={{ 
                backgroundColor: admin?.role === 'admin' ? '#fbbf24' : '#34d399',
                color: '#1f2937',
                marginRight: 'var(--spacing-xs)'
              }}>
                {admin?.role === 'admin' ? '👑 Admin' : '👨‍🏫 Professor'}
              </small>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)', marginRight: 'var(--spacing-md)' }}>
              Olá, <strong>{admin?.nome || 'Usuário'}</strong>
            </span>
            <button 
              onClick={handleLogout} 
              className="btn"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-xs) var(--spacing-md)',
                transition: 'all 0.3s ease'
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
