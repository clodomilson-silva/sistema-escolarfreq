import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./FormPages.css";

interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
}

function TurmaEdit() {
  const [turma, setTurma] = useState<Turma>({
    id: '',
    nome: '',
    ano: '',
    turno: 'matutino'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isReady } = useAuth();

  useEffect(() => {
    const carregarTurmaData = async () => {
      try {
        setLoading(true);
        console.log('Carregando turma:', id);
        
        const response = await api.get(`/turmas/${id}`);
        console.log('Resposta da API:', response.data);
        
        if (response.data.success) {
          setTurma(response.data.data);
        } else {
          console.error('Erro na resposta:', response.data.message);
          alert('Erro ao carregar turma: ' + response.data.message);
          navigate('/turmas');
        }
      } catch (error: unknown) {
        console.error('Erro ao carregar turma:', error);
        
        let mensagem = 'Erro ao carregar turma!';
        if (error instanceof Error) {
          if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
            const responseData = error.response.data as { message?: string };
            if (responseData.message) {
              mensagem = responseData.message;
            }
          } else if (error.message) {
            mensagem = error.message;
          }
        }
        
        alert(mensagem);
        navigate('/turmas');
      } finally {
        setLoading(false);
      }
    };

    if (isReady && id) {
      carregarTurmaData();
    }
  }, [isReady, id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTurma(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    if (!turma.nome.trim()) {
      novosErros.nome = 'Nome da turma é obrigatório';
    }

    if (!turma.ano || !turma.ano.trim()) {
      novosErros.ano = 'Número da turma é obrigatório';
    }

    if (!turma.turno) {
      novosErros.turno = 'Turno é obrigatório';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setSaving(true);
      console.log('Atualizando turma:', turma);

      const dadosParaEnviar = {
        nome: turma.nome.trim(),
        ano: turma.ano,
        turno: turma.turno
      };

      const response = await api.put(`/turmas/${id}`, dadosParaEnviar);
      console.log('Resposta da atualização:', response.data);

      if (response.data.success) {
        alert('Turma atualizada com sucesso!');
        navigate('/turmas');
      } else {
        console.error('Erro na resposta:', response.data);
        alert('Erro ao atualizar turma: ' + response.data.message);
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar turma:', error);
      
      let mensagem = 'Erro ao atualizar turma!';
      
      if (error instanceof Error && 'response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as { data?: { details?: Array<{ field: string; message: string }>; message?: string } };
        
        if (response.data?.details) {
          // Erro de validação do backend
          const detalhes = response.data.details;
          const novosErros: { [key: string]: string } = {};
          
          detalhes.forEach((erro: { field: string; message: string }) => {
            novosErros[erro.field] = erro.message;
          });
          
          setErrors(novosErros);
          return;
        } else if (response.data?.message) {
          mensagem = response.data.message;
        }
      } else if (error instanceof Error && error.message) {
        mensagem = error.message;
      }
      
      alert(mensagem);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

    return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="form-page-header">
          <div className="row">
            <div className="col-12">
              <h1 className="form-page-title text-success">✏️ Editar Turma</h1>
              <p className="form-page-subtitle">Edite os dados da turma selecionada</p>
              <div className="form-page-actions">
                <Link to="/home" className="form-page-btn btn btn-outline-secondary">
                  🏠 Voltar para Home
                </Link>
                <Link to="/turmas" className="form-page-btn btn btn-outline-success">
                  🏫 Ver Lista de Turmas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de erro */}
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
            <strong>❌ Erros encontrados:</strong>
            <ul className="mb-0 mt-2">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="form-page-card">
              <div className="form-page-form">

                <form onSubmit={handleSubmit}>
                  <div className="form-page-form-group">
                    <label htmlFor="nome" className="form-page-label">
                      Nome da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-page-input ${errors.nome ? 'is-invalid' : ''}`}
                      id="nome"
                      name="nome"
                      value={turma.nome}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      placeholder="Ex: 1º Ano A, 2º Ano B, etc."
                    />
                    {errors.nome && (
                      <div className="invalid-feedback">
                        {errors.nome}
                      </div>
                    )}
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="ano" className="form-page-label">
                      Número da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-page-input ${errors.ano ? 'is-invalid' : ''}`}
                      id="ano"
                      name="ano"
                      value={turma.ano}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      placeholder="Ex: 101, 201.1, 301.A, 1º ano..."
                    />
                    {errors.ano && (
                      <div className="invalid-feedback">
                        {errors.ano}
                      </div>
                    )}
                  </div>

                  <div className="form-page-form-group">
                    <label htmlFor="turno" className="form-page-label">
                      Turno: <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-page-select ${errors.turno ? 'is-invalid' : ''}`}
                      id="turno"
                      name="turno"
                      value={turma.turno}
                      onChange={handleChange}
                      required
                      disabled={saving}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="matutino">🌅 Manhã (Matutino)</option>
                      <option value="vespertino">☀️ Tarde (Vespertino)</option>
                      <option value="noturno">🌙 Noite (Noturno)</option>
                      <option value="integral">🌞 Integral</option>
                    </select>
                    {errors.turno && (
                      <div className="invalid-feedback">
                        {errors.turno}
                      </div>
                    )}
                  </div>

                  <div className="form-page-form-actions">
                    <Link to="/turmas" className="form-page-cancel-btn">
                      ❌ Cancelar
                    </Link>
                    <button 
                      type="submit" 
                      className="form-page-submit-btn btn btn-success"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Salvando...
                        </>
                      ) : (
                        "💾 Salvar Alterações"
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

export default TurmaEdit;
