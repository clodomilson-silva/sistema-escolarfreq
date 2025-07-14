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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <a className="navbar-brand text-primary fw-bold" href="/home">
          🏫 Sistema Escolar
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="/home">🏠 Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/alunos">👥 Alunos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/turmas">🏫 Turmas</a>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">
              Olá, <strong>{admin?.nome || 'Admin'}</strong>
            </span>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
