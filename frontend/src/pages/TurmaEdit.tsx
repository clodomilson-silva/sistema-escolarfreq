import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

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
    <>
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="card shadow">
              <div className="card-header bg-warning text-dark">
                <h5 className="card-title mb-0">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Turma
                </h5>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="nome" className="form-label">
                        <i className="bi bi-tag me-1"></i>
                        Nome da Turma *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                        id="nome"
                        name="nome"
                        value={turma.nome}
                        onChange={handleChange}
                        placeholder="Digite o nome da turma"
                        disabled={saving}
                      />
                      {errors.nome && (
                        <div className="invalid-feedback">
                          {errors.nome}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label htmlFor="ano" className="form-label">
                        <i className="bi bi-hash me-1"></i>
                        Número da Turma *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.ano ? 'is-invalid' : ''}`}
                        id="ano"
                        name="ano"
                        value={turma.ano}
                        onChange={handleChange}
                        placeholder="Ex: 101, 201.1, 1º ano..."
                        disabled={saving}
                      />
                      {errors.ano && (
                        <div className="invalid-feedback">
                          {errors.ano}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label htmlFor="turno" className="form-label">
                        <i className="bi bi-clock me-1"></i>
                        Turno *
                      </label>
                      <select
                        className={`form-select ${errors.turno ? 'is-invalid' : ''}`}
                        id="turno"
                        name="turno"
                        value={turma.turno}
                        onChange={handleChange}
                        disabled={saving}
                      >
                        <option value="">Selecione o turno</option>
                        <option value="matutino">🌅 Manhã</option>
                        <option value="vespertino">☀️ Tarde</option>
                        <option value="noturno">🌙 Noite</option>
                        <option value="integral">🌞 Integral</option>
                      </select>
                      {errors.turno && (
                        <div className="invalid-feedback">
                          {errors.turno}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Dica:</strong> Você pode alterar o nome, número e turno da turma. 
                        Os alunos já associados à turma serão mantidos.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/turmas')}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Voltar
                    </button>
                    
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/turmas/${id}`)}
                        disabled={saving}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver Detalhes
                      </button>
                      
                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1"></i>
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TurmaEdit;
