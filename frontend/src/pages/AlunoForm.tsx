import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AlunoForm() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alunos/", {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email
      });
      alert("Aluno cadastrado com sucesso!");
      navigate("/alunos"); // Redireciona para a lista de alunos
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert("Erro ao cadastrar aluno!");
    }
  };

  return (
    <div>
      <h1>Cadastrar Novo Aluno</h1>
      
      {/* Botão para voltar para a página Home */}
      <Link to="/">
        <button style={{ marginBottom: "10px" }}>🏠 Voltar para Home</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label>Matrícula:</label>
        <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />

        <label>Data de Nascimento:</label>
        <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default AlunoForm;
