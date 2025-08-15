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
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4 px-4">
        <div className="row justify-content-center">
          <div className="col-12">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2 mb-0">
                <span className="text-warning">✏️</span> Editar Turma
              </h1>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/turmas')}
              >
                🔙 Voltar para Lista
              </button>
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

            {/* Formulário */}
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-warning text-dark text-center py-4" style={{ borderRadius: '20px 20px 0 0' }}>
                <div className="d-inline-flex align-items-center justify-content-center bg-white text-warning rounded-circle mb-3" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  🏫
                </div>
                <h3 className="mb-1">Atualizar Informações da Turma</h3>
                <p className="mb-0">Edite os dados da turma abaixo</p>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Informações Básicas */}
                    <div className="col-12">
                      <h5 className="text-warning mb-3">📋 Informações Básicas</h5>
                    </div>

                    <div className="col-12">
                      <label htmlFor="nome" className="form-label fw-semibold">
                        🏷️ Nome da Turma: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.nome ? 'is-invalid' : ''}`}
                        id="nome"
                        name="nome"
                        value={turma.nome}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="Digite o nome da turma"
                        style={{ borderRadius: '12px' }}
                      />
                      {errors.nome && (
                        <div className="invalid-feedback">
                          {errors.nome}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="ano" className="form-label fw-semibold">
                        🔢 Número da Turma: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.ano ? 'is-invalid' : ''}`}
                        id="ano"
                        name="ano"
                        value={turma.ano}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="Ex: 101, 201.1, 1º ano..."
                        style={{ borderRadius: '12px' }}
                      />
                      {errors.ano && (
                        <div className="invalid-feedback">
                          {errors.ano}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="turno" className="form-label fw-semibold">
                        ⏰ Turno: <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.turno ? 'is-invalid' : ''}`}
                        id="turno"
                        name="turno"
                        value={turma.turno}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        style={{ borderRadius: '12px' }}
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

                    {/* Observação sobre campos obrigatórios */}
                    <div className="col-12">
                      <small className="text-muted">
                        <span className="text-danger">*</span> Campos obrigatórios
                      </small>
                    </div>

                    {/* Dica informativa */}
                    <div className="col-12">
                      <div className="alert alert-info border-0 rounded-3" role="alert">
                        <strong>💡 Dica:</strong> Você pode alterar o nome, número e turno da turma. 
                        Os alunos já associados à turma serão mantidos.
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="col-12 mt-5">
                      <div className="d-flex gap-3 justify-content-center">
                        <button 
                          type="submit" 
                          className="btn btn-warning btn-lg px-5"
                          disabled={saving}
                          style={{ borderRadius: '12px' }}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Salvando...
                            </>
                          ) : (
                            <>
                              💾 Salvar Alterações
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-info btn-lg px-5"
                          onClick={() => navigate(`/turmas/${id}`)}
                          disabled={saving}
                          style={{ borderRadius: '12px' }}
                        >
                          👁️ Ver Detalhes
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-5"
                          onClick={() => navigate('/turmas')}
                          disabled={saving}
                          style={{ borderRadius: '12px' }}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
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
