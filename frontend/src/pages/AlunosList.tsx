import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AlunosList.css"; // Importando o novo arquivo CSS

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  data_nascimento: string;
  email: string;
}

function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = () => {
    api.get("/alunos")
      .then((response) => {
        // A API retorna { success: true, data: [...], total: number }
        const alunos = response.data.data || response.data;
        setAlunos(alunos);
      })
      .catch((error) => {
        console.error("Erro ao buscar alunos:", error);
      });
  };

  const excluirAluno = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await api.delete(`/alunos/${id}`);
        alert("Aluno excluído com sucesso!");
        carregarAlunos(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno!");
      }
    }
  };

  return (
    <div className="alunos-container">
      <h1 className="alunos-title">Lista de Alunos</h1>
      <nav className="alunos-nav">
        <ul className="alunos-nav-list">
          <li className="alunos-nav-item">
            <Link to="/home" className="alunos-nav-link">🏠 Voltar para Home</Link>
          </li>
          <li className="alunos-nav-item">
            <Link to="/alunos/novo" className="alunos-nav-link">➕ Cadastrar Novo Aluno</Link>
          </li>
        </ul>
      </nav>
      <table className="alunos-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno) => (
            <tr key={aluno.id}>
              <td>{aluno.nome}</td>
              <td>{aluno.email}</td>
              <td>
                <button
                  onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                  className="alunos-action-button"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => excluirAluno(aluno.id)}
                  className="alunos-action-button delete"
                >
                  🗑 Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlunosList;
