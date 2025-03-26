import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Aluno {
  id: number;
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
    api.get("/alunos/")
      .then((response) => {
        setAlunos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar alunos:", error);
      });
  };

  const excluirAluno = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await api.delete(`/alunos/${id}/`);
        alert("Aluno excluído com sucesso!");
        carregarAlunos(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno!");
      }
    }
  };

  return (
    <div>
      <h1>Lista de Alunos</h1>

      {/* Botão para voltar à Home */}
      <Link to="/">
        <button style={{ marginBottom: "10px" }}>🏠 Voltar para Home</button>
      </Link>

      {/* Botão para cadastrar um novo aluno */}
      <Link to="/alunos/novo">
        <button style={{ marginBottom: "10px", marginLeft: "10px" }}>➕ Cadastrar Novo Aluno</button>
      </Link>

      <ul>
        {alunos.map((aluno) => (
          <li key={aluno.id}>
            {aluno.nome} - {aluno.email}
            <button onClick={() => navigate(`/alunos/editar/${aluno.id}`)}>✏️ Editar</button>
            <button onClick={() => excluirAluno(aluno.id)} style={{ marginLeft: "10px", color: "red" }}>🗑 Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlunosList;
