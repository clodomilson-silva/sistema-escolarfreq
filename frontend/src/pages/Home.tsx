import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de logout pode ser adicionada aqui, se necessário
    navigate("/"); // Redireciona para a página de login
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao Sistema Escolar</h1>
      <nav className="home-nav">
        <button
          className="home-button"
          onClick={() => navigate("/alunos")}
        >
          Gerenciar alunos
        </button>
        <button
          className="home-button"
          onClick={() => navigate("/turmas")}
        >
          Gerenciar turmas
        </button>
        <button
          className="home-button logout-button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </nav>
    </div>
  );
}

export default Home;
