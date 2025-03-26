import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Aluno {
  id: number;
  nome: string;
  email: string;
}

function AlunoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/alunos/${id}`)
      .then((response) => setAluno(response.data))
      .catch((error) => {
        console.error("Erro ao buscar aluno:", error);
        alert("Aluno não encontrado!");
        navigate("/alunos");
      });
  }, [id, navigate]);

  if (!aluno) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Detalhes do Aluno</h1>
      <p><strong>Nome:</strong> {aluno.nome}</p>
      <p><strong>Email:</strong> {aluno.email}</p>
      <button onClick={() => navigate("/alunos")}>Voltar</button>
    </div>
  );
}

export default AlunoDetalhes;
