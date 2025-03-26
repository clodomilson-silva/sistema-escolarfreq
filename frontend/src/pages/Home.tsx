import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Bem-vindo ao Sistema Escolar</h1>
      <nav>
        <ul>
          <li><Link to="/alunos">Lista de Alunos</Link></li>
          <li><Link to="/alunos/novo">Cadastrar Aluno</Link></li> {/* Corrigido */}
        </ul>
      </nav>
    </div>
  );
}

export default Home;
