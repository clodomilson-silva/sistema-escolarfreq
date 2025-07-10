import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AlunoEdit() {
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/alunos/${id}/`)
      .then((response) => {
        setNome(response.data.nome);
        setMatricula(response.data.matricula);
        setDataNascimento(response.data.data_nascimento);
        setEmail(response.data.email);
      })
      .catch((error) => {
        console.error("Erro ao carregar aluno:", error);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/alunos/${id}/`, {
        nome,
        matricula,
        data_nascimento: dataNascimento,
        email,
      });
      alert("Aluno atualizado com sucesso!");
      navigate("/alunos"); // Redireciona para a lista de alunos
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      alert("Erro ao atualizar aluno!");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Editar Aluno</h1>
      <nav className="form-nav">
        <Link to="/alunos" className="form-nav-link">🔙 Voltar para Lista</Link>
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

        <button type="submit" className="form-button">Salvar Alterações</button>
      </form>
    </div>
  );
}

export default AlunoEdit;
