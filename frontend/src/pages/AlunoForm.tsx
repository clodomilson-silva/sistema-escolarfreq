import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AlunoForm.css"; // Importando o novo arquivo CSS

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
        email,
      });
      alert("Aluno cadastrado com sucesso!");
      navigate("/alunos"); // Redireciona para a lista de alunos
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert("Erro ao cadastrar aluno!");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Cadastrar Novo Aluno</h1>
      <nav className="form-nav">
        <Link to="/" className="form-nav-link">🏠 Voltar para Home</Link>
      </nav>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="form-input"
        />

        <label className="form-label">Matrícula:</label>
        <input
          type="text"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
          className="form-input"
        />

        <label className="form-label">Data de Nascimento:</label>
        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          required
          className="form-input"
        />

        <label className="form-label">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />

        <button type="submit" className="form-button">Cadastrar</button>
      </form>
    </div>
  );
}

export default AlunoForm;
