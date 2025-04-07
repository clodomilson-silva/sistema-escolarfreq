import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AlunoForm.css"; // Reutilizando o CSS de AlunoForm

function TurmaForm() {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState<number | "">("");
  const [turno, setTurno] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/turmas/", {
        nome,
        ano,
        turno,
      });
      alert("Turma cadastrada com sucesso!");
      navigate("/turmas"); // Redireciona para a lista de turmas
    } catch (error) {
      console.error("Erro ao cadastrar turma:", error);
      alert("Erro ao cadastrar turma!");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Cadastrar Nova Turma</h1>
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

        <label className="form-label">Ano:</label>
        <input
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          required
          className="form-input"
        />

        <label className="form-label">Turno:</label>
        <select
          value={turno}
          onChange={(e) => setTurno(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Selecione o turno</option>
          <option value="Manhã">Manhã</option>
          <option value="Tarde">Tarde</option>
          <option value="Noite">Noite</option>
        </select>

        <button type="submit" className="form-button">Cadastrar</button>
      </form>
    </div>
  );
}

export default TurmaForm;
