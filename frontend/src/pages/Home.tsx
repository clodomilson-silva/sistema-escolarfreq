import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { admin } = useAuth();

  return (
    <div className="home-container">
      <Navbar />
      <div className="container">
        <div className="home-welcome text-center">
          <h1 className="home-title">
            Bem-vindo ao Ponto Class! 👋
          </h1>
          <p className="home-subtitle">
            Olá, <strong>{admin?.nome || "Usuário"}</strong>!{' '}
            {admin?.role === 'admin' 
              ? 'Gerencie alunos, turmas e todo o sistema de forma eficiente.'
              : 'Gerencie suas turmas-disciplina e registre frequência dos alunos.'}
          </p>
          {admin?.role === 'professor' && admin?.disciplinas && admin.disciplinas.length > 0 && (
            <p className="text-muted">
              <strong>Disciplinas:</strong>{' '}
              {admin.disciplinas.map((d, i) => (
                <span key={i} className="badge bg-primary mx-1">{d}</span>
              ))}
            </p>
          )}
        </div>

        <div className="row g-4">
          {admin?.role === 'admin' && (
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
          )}

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
                <h3 className="card-title text-success">
                  {admin?.role === 'admin' ? 'Gerenciar Turmas' : 'Minhas Turmas-Disciplina'}
                </h3>
                <p className="card-text text-muted">
                  {admin?.role === 'admin' 
                    ? 'Criar e organizar turmas base e turmas-disciplina'
                    : 'Criar turmas-disciplina e registrar frequência dos alunos'}
                </p>
                <div className="mt-3">
                  <span className="badge bg-success">Frequência</span>
                  {admin?.role === 'admin' && (
                    <>
                      <span className="badge bg-warning ms-2">Gestão</span>
                      <span className="badge bg-info ms-2">Organização</span>
                    </>
                  )}
                  {admin?.role === 'professor' && (
                    <span className="badge bg-info ms-2">Disciplinas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className={`alert text-center ${admin?.role === 'admin' ? 'alert-info' : 'alert-success'}`}>
              <h5 className="alert-heading">
                {admin?.role === 'admin' ? '💡 Controle Total' : '📚 Área do Professor'}
              </h5>
              <p className="mb-0">
                {admin?.role === 'admin' 
                  ? 'Como administrador, você tem acesso completo ao sistema. Gerencie alunos, turmas base, professores e visualize todas as informações.'
                  : 'Como professor, você pode criar turmas-disciplina vinculadas às turmas base e registrar a frequência dos alunos em suas disciplinas.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
