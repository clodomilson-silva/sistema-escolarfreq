import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AlunosList from "./pages/AlunosList";
import AlunoForm from "./pages/AlunoForm";
import AlunoDetalhes from "./pages/AlunoDetalhes";
import AlunoEdit from "./pages/AlunoEdit";
import TurmasList from "./pages/TurmasList";
import TurmaForm from "./pages/TurmaForm";
import TurmaDetalhes from "./pages/TurmaDetalhes";
import TurmaEdit from "./pages/TurmaEdit";
import TurmaDisciplinaForm from "./pages/TurmaDisciplinaForm";
import FrequenciaDashboard from "./pages/FrequenciaDashboard";
import AvaliacaoForm from "./pages/AvaliacaoForm";
import NotasLancamento from "./pages/NotasLancamento";
import BoletimAluno from "./pages/BoletimAluno";
import LoginAuth from "./pages/LoginAuth";
import RegistroUsuario from "./pages/RegistroUsuario";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<LoginAuth />} />
        
        {/* Rota de registro */}
        <Route path="/registro" element={<RegistroUsuario />} />
        
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
        
        <Route path="/turmas/disciplina/nova" element={
          <ProtectedRoute>
            <TurmaDisciplinaForm />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/:id" element={
          <ProtectedRoute>
            <TurmaDetalhes />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/editar/:id" element={
          <ProtectedRoute>
            <TurmaEdit />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/:turmaId/frequencia" element={
          <ProtectedRoute>
            <FrequenciaDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/:turmaId/avaliacoes/nova" element={
          <ProtectedRoute>
            <AvaliacaoForm />
          </ProtectedRoute>
        } />
        
        <Route path="/turmas/:turmaId/notas" element={
          <ProtectedRoute>
            <NotasLancamento />
          </ProtectedRoute>
        } />
        
        <Route path="/alunos/:alunoId/boletim" element={
          <ProtectedRoute>
            <BoletimAluno />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
