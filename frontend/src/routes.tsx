import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AlunosList from "./pages/AlunosList";
import AlunoForm from "./pages/AlunoForm";
import AlunoDetalhes from "./pages/AlunoDetalhes";
import AlunoEdit from "./pages/AlunoEdit";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alunos" element={<AlunosList />} />
        <Route path="/alunos/novo" element={<AlunoForm />} />
        <Route path="/alunos/:id" element={<AlunoDetalhes />} />
        <Route path="/alunos/editar/:id" element={<AlunoEdit />} /> {/* Nova Rota */}
      </Routes>
    </Router>
  );
}
