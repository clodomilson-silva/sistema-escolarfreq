import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AlunoForm.css"; // Reutilizando o CSS de AlunoForm

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Lógica de autenticação comentada
      // if (email === "admin@example.com" && password === "password") {
      //   alert("Login realizado com sucesso!");
      //   navigate("/home"); // Redireciona para a página inicial
      // } else {
      //   alert("Credenciais inválidas!");
      // }
      navigate("/home"); // Navegação normal para a rota '/home'
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      alert("Erro ao realizar login!");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />

        <label className="form-label">Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />

        <button type="submit" className="form-button">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
