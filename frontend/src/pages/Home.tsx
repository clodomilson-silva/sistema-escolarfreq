import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { admin } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center mb-5">
            <h1 className="display-4 text-primary mb-3">
              Bem-vindo ao Sistema Escolar! 👋
            </h1>
            <p className="lead text-muted">
              Olá, <strong>{admin?.nome || "Admin"}</strong>! Gerencie alunos e
              turmas de forma eficiente.
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div
              className="card h-100 shadow-sm border-0 cursor-pointer"
              onClick={() => navigate("/alunos")}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="card-body text-center p-4">
                <div className="display-1 text-primary mb-3">👥</div>
                <h3 className="card-title text-primary">Gerenciar Alunos</h3>
                <p className="card-text text-muted">
                  Visualizar, adicionar e editar informações dos alunos
                  matriculados
                </p>
                <div className="mt-3">
                  <span className="badge bg-primary">Cadastro</span>
                  <span className="badge bg-info ms-2">Lista</span>
                  <span className="badge bg-success ms-2">Edição</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="card h-100 shadow-sm border-0 cursor-pointer"
              onClick={() => navigate("/turmas")}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="card-body text-center p-4">
                <div className="display-1 text-success mb-3">🏫</div>
                <h3 className="card-title text-success">Gerenciar Turmas</h3>
                <p className="card-text text-muted">
                  Criar e organizar turmas para acompanhamento de frequência e
                  autorizações
                </p>
                <div className="mt-3">
                  <span className="badge bg-success">Frequência</span>
                  <span className="badge bg-warning ms-2">Autorizações</span>
                  <span className="badge bg-info ms-2">Organização</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="alert alert-info text-center">
              <h5 className="alert-heading">💡 Sistema Seguro</h5>
              <p className="mb-0">
                Apenas administradores autenticados podem acessar as
                funcionalidades do sistema. Todas as operações são protegidas e
                registradas para auditoria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
