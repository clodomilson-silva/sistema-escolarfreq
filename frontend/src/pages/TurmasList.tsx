import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AlunosList.css"; // Reutilizando o CSS de AlunosList

interface Turma {
  id: number;
  nome: string;
  ano: number;
  turno: string;
}

function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarTurmas();
  }, []);

  const carregarTurmas = () => {
    api.get("/turmas/")
      .then((response) => {
        setTurmas(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar turmas:", error);
      });
  };

  const excluirTurma = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        await api.delete(`/turmas/${id}/`);
        alert("Turma excluída com sucesso!");
        carregarTurmas(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir turma:", error);
        alert("Erro ao excluir turma!");
      }
    }
  };

  return (
    <div className="alunos-container">
      <h1 className="alunos-title">Lista de Turmas</h1>
      <nav className="alunos-nav">
        <ul className="alunos-nav-list">
          <li className="alunos-nav-item">
            <Link to="/home" className="alunos-nav-link">🏠 Voltar para Home</Link>
          </li>
          <li className="alunos-nav-item">
            <Link to="/turmas/nova" className="alunos-nav-link">➕ Cadastrar Nova Turma</Link>
          </li>
        </ul>
      </nav>
      <table className="alunos-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ano</th>
            <th>Turno</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {turmas.map((turma) => (
            <tr key={turma.id}>
              <td>{turma.nome}</td>
              <td>{turma.ano}</td>
              <td>{turma.turno}</td>
              <td>
                <button
                  onClick={() => navigate(`/turmas/editar/${turma.id}`)}
                  className="alunos-action-button"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => excluirTurma(turma.id)}
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

export default TurmasList;
