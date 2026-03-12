import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./FormPages.css";

function TurmaForm() {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [turno, setTurno] = useState("");
  const [nivelEnsino, setNivelEnsino] = useState<'fundamental' | 'medio' | 'tecnico' | 'profissionalizante'>('fundamental');
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica no frontend
    if (!nome || !ano || !turno || !dataInicio || !dataFim) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      alert("A data de término deve ser maior ou igual à data de início.");
      return;
    }

    if (nivelEnsino === 'fundamental' || nivelEnsino === 'medio') {
      const mesInicio = new Date(dataInicio).getMonth() + 1;
      const mesFim = new Date(dataFim).getMonth() + 1;
      if (mesInicio === 7 || mesFim === 7) {
        alert("Para ensino fundamental e médio, julho é mês de férias e não pode ser usado como início ou término.");
        return;
      }
    }

    setLoading(true);
    
    try {
      const response = await api.post("/turmas/", {
        nome,
        ano: ano,
        turno,
        tipo: 'base',
        nivel_ensino: nivelEnsino,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status: 'ativa'
      });
      
      console.log('Turma cadastrada:', response.data);
      alert("Turma cadastrada com sucesso!");
      
      // Limpar formulário
      setNome("");
      setAno("");
      setTurno("");
      setNivelEnsino('fundamental');
      setDataInicio("");
      setDataFim("");
      
      navigate("/turmas");
    } catch (error) {
      console.error("Erro ao cadastrar turma:", error);
      
      let mensagemErro = "Erro ao cadastrar turma!";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; details?: string };
            status?: number;
          };
          request?: unknown;
        };
        
        if (axiosError.response) {
          if (axiosError.response.data?.message) {
            mensagemErro = axiosError.response.data.message;
          } else if (axiosError.response.data?.details) {
            mensagemErro = axiosError.response.data.details;
          } else if (axiosError.response.status === 400) {
            mensagemErro = "Dados inválidos ou turma já existe!";
          } else if (axiosError.response.status === 500) {
            mensagemErro = "Erro interno do servidor!";
          }
        } else if (axiosError.request) {
          mensagemErro = "Erro de conexão com o servidor!";
        }
      }
      
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="page-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--success-color), #20c997)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <i className="bi bi-grid-3x3-gap" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', margin: 0 }}>Cadastrar Nova Turma</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Preencha os dados da nova turma</p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/home" className="btn btn-outline-secondary">
              <i className="bi bi-house-door me-2"></i>Voltar para Home
            </Link>
            <Link to="/turmas" className="btn btn-outline-success">
              <i className="bi bi-grid-3x3-gap me-2"></i>Ver Lista de Turmas
            </Link>
          </div>
        </div>
        
        <div className="row justify-content-center mt-4">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body p-4">

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Nome da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ex: 1º Ano A, 2º Ano B, etc."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ano" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Número da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="ano"
                      value={ano}
                      onChange={(e) => setAno(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ex: 101, 201.1, 301.A, 1º ano..."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="turno" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Turno: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="turno"
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="matutino">Manhã (Matutino)</option>
                      <option value="vespertino">Tarde (Vespertino)</option>
                      <option value="noturno">Noite (Noturno)</option>
                      <option value="integral">Integral</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nivel_ensino" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      Tipo de Ensino: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="nivel_ensino"
                      value={nivelEnsino}
                      onChange={(e) => setNivelEnsino(e.target.value as 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante')}
                      required
                      disabled={loading}
                    >
                      <option value="fundamental">Ensino Fundamental</option>
                      <option value="medio">Ensino Medio</option>
                      <option value="tecnico">Curso Tecnico</option>
                      <option value="profissionalizante">Curso Profissionalizante</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="data_inicio" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        Data de Inicio: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="data_inicio"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="data_fim" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        Data de Termino: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="data_fim"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="alert alert-info py-2">
                    {nivelEnsino === 'fundamental' || nivelEnsino === 'medio'
                      ? 'Ensino regular: defina o periodo letivo padrao. Julho e tratado como mes de ferias.'
                      : 'Cursos tecnico/profissionalizante: informe apenas as datas de inicio e termino do curso.'}
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <Link to="/turmas" className="btn btn-outline-secondary">
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>Cadastrar Turma
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurmaForm;
