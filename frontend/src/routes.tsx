import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AlunosList from "./pages/AlunosList";
import AlunoForm from "./pages/AlunoForm";
import AlunoDetalhes from "./pages/AlunoDetalhes";
import AlunoEdit from "./pages/AlunoEdit";
import TurmasList from "./pages/TurmasList";
import TurmaForm from "./pages/TurmaForm";
import LoginAuth from "./pages/LoginAuth";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<LoginAuth />} />
        
        {/* Redirect da raiz para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rotas protegidas */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos" element={
          <ProtectedRoute>
            <AlunosList />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos/novo" element={
          <ProtectedRoute>
            <AlunoForm />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos/:id" element={
          <ProtectedRoute>
            <AlunoDetalhes />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos/editar/:id" element={
          <ProtectedRoute>
            <AlunoEdit />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas" element={
          <ProtectedRoute>
            <TurmasList />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/nova" element={
          <ProtectedRoute>
            <TurmaForm />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
