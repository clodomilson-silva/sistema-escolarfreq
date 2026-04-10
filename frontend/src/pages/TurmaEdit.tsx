import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./FormPages.css";

interface Turma {
  id: string;
  nome: string;
  ano: string | number;
  turno: string;
  tipo?: 'base' | 'disciplina';
  nivel_ensino?: 'fundamental' | 'medio' | 'tecnico' | 'profissionalizante';
  disciplina?: string;
  professor?: string | null;
  professor_id?: string | number | null;
  sala?: string | null;
  status?: 'ativa' | 'inativa' | 'concluida';
  data_inicio?: string | null;
  data_fim?: string | null;
}

interface ProfessorOption {
  id: string;
  nome: string;
  email: string;
  matricula?: string | null;
}

function TurmaEdit() {
  const [turma, setTurma] = useState<Turma>({
    id: '',
    nome: '',
    ano: '',
    turno: 'matutino',
    tipo: 'base',
    nivel_ensino: 'fundamental',
    data_inicio: '',
    data_fim: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professores, setProfessores] = useState<ProfessorOption[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isReady } = useAuth();
  const isTurmaBase = (turma.tipo || 'base') === 'base';
  const exigeDatasDisciplina =
    turma.tipo === 'disciplina' &&
    (turma.nivel_ensino === 'tecnico' || turma.nivel_ensino === 'profissionalizante');
  const exigeDatas = isTurmaBase || exigeDatasDisciplina;

  useEffect(() => {
    const carregarTurmaData = async () => {
      try {
        setLoading(true);
        console.log('Carregando turma:', id);
        
        const [turmaResponse, professoresResponse] = await Promise.all([
          api.get(`/turmas/${id}/`),
          api.get('/auth/users/')
        ]);

        console.log('Resposta da API:', turmaResponse.data);

        const payload = professoresResponse.data;
        const users = Array.isArray(payload) ? payload : payload?.results || payload?.data || [];
        const listaProfessores = users
          .filter((u: { role?: string }) => u.role === 'professor')
          .map((u: { id: string; nome: string; email: string; matricula?: string | null }) => ({
            id: String(u.id),
            nome: u.nome,
            email: u.email,
            matricula: u.matricula || null
          }));
        setProfessores(listaProfessores);
        
        if (turmaResponse.data.success) {
          const turmaData = turmaResponse.data.data;
          setTurma({
            ...turmaData,
            ano: String(turmaData.ano ?? ''),
            professor_id: turmaData.professor_id ? String(turmaData.professor_id) : '',
            data_inicio: turmaData.data_inicio || '',
            data_fim: turmaData.data_fim || ''
          });
        } else {
          console.error('Erro na resposta:', turmaResponse.data.message);
          alert('Erro ao carregar turma: ' + turmaResponse.data.message);
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
    const anoTexto = String(turma.ano ?? '').trim();

    if (!turma.nome.trim()) {
      novosErros.nome = 'Nome da turma é obrigatório';
    }

    if (!anoTexto) {
      novosErros.ano = 'Número da turma é obrigatório';
    } else if (!/^\d+$/.test(anoTexto)) {
      novosErros.ano = 'Ano deve conter apenas números';
    }

    if (!turma.turno) {
      novosErros.turno = 'Turno é obrigatório';
    }

    if (!turma.nivel_ensino) {
      novosErros.nivel_ensino = 'Tipo de ensino é obrigatório';
    }

    if (exigeDatas && !turma.data_inicio) {
      novosErros.data_inicio = 'Data de início é obrigatória';
    }

    if (exigeDatas && !turma.data_fim) {
      novosErros.data_fim = 'Data de término é obrigatória';
    }

    if (exigeDatas && turma.data_inicio && turma.data_fim && new Date(turma.data_inicio) > new Date(turma.data_fim)) {
      novosErros.data_fim = 'Data de término deve ser maior ou igual à data de início';
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
        ano: Number(String(turma.ano).trim()),
        turno: turma.turno,
        disciplina: turma.disciplina || 'Geral',
        professor_id: turma.professor_id ? Number(turma.professor_id) : null,
        professor: turma.professor || null,
        sala: turma.sala || null,
        tipo: turma.tipo || 'base',
        nivel_ensino: turma.nivel_ensino || 'fundamental',
        status: turma.status || 'ativa',
        data_inicio: exigeDatas ? (turma.data_inicio || null) : null,
        data_fim: exigeDatas ? (turma.data_fim || null) : null
      };

      const response = await api.put(`/turmas/${id}/`, dadosParaEnviar);
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
        const response = error.response as {
          data?: {
            details?: Array<{ field: string; message: string }>;
            detail?: Record<string, string[] | string>;
            message?: string;
            error?: string;
          }
        };
        
        if (response.data?.details) {
          // Erro de validação do backend
          const detalhes = response.data.details;
          const novosErros: { [key: string]: string } = {};
          
          detalhes.forEach((erro: { field: string; message: string }) => {
            novosErros[erro.field] = erro.message;
          });
          
          setErrors(novosErros);
          return;
        } else if (response.data?.detail && typeof response.data.detail === 'object') {
          const novosErros: { [key: string]: string } = {};
          Object.entries(response.data.detail).forEach(([campo, valor]) => {
            if (Array.isArray(valor)) {
              novosErros[campo] = valor.join(' ');
            } else {
              novosErros[campo] = String(valor);
            }
          });
          setErrors(novosErros);
          return;
        } else if (response.data?.message) {
          mensagem = response.data.message;
        } else if (response.data?.error) {
          mensagem = response.data.error;
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
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="mb-4">
          <div className="row">
            <div className="col-12">
              <h1 className="h2 mb-3 text-white">
                <i className="bi bi-pencil me-2"></i>
                Editar Turma
              </h1>
              <p className="text-white-50 mb-3">Edite os dados da turma selecionada</p>
              <div className="d-flex gap-2 mb-3">
                <Link to="/home" className="btn btn-outline-secondary">
                  <i className="bi bi-house-door me-1"></i>
                  Voltar para Home
                </Link>
                <Link to="/turmas" className="btn btn-outline-success">
                  <i className="bi bi-grid-3x3-gap me-1"></i>
                  Ver Lista de Turmas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de erro */}
        {Object.keys(errors).length > 0 && (
          <div 
            className="alert alert-danger mb-4" 
            role="alert"
            style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              color: '#dc3545'
            }}
          >
            <strong>
              <i className="bi bi-x-circle me-2"></i>
              Erros encontrados:
            </strong>
            <ul className="mb-0 mt-2">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label text-white">
                      Nome da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                      id="nome"
                      name="nome"
                      value={turma.nome}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      placeholder="Ex: 1º Ano A, 2º Ano B, etc."
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    {errors.nome && (
                      <div className="invalid-feedback">
                        {errors.nome}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ano" className="form-label text-white">
                      Número da Turma: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.ano ? 'is-invalid' : ''}`}
                      id="ano"
                      name="ano"
                      value={turma.ano}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      placeholder="Ex: 101, 201.1, 301.A, 1º ano..."
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    {errors.ano && (
                      <div className="invalid-feedback">
                        {errors.ano}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="turno" className="form-label text-white">
                      Turno: <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.turno ? 'is-invalid' : ''}`}
                      id="turno"
                      name="turno"
                      value={turma.turno}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="">Selecione o turno</option>
                      <option value="matutino">Manhã (Matutino)</option>
                      <option value="vespertino">Tarde (Vespertino)</option>
                      <option value="noturno">Noite (Noturno)</option>
                      <option value="integral">Integral</option>
                    </select>
                    {errors.turno && (
                      <div className="invalid-feedback">
                        {errors.turno}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nivel_ensino" className="form-label text-white">
                      Tipo de Ensino: <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.nivel_ensino ? 'is-invalid' : ''}`}
                      id="nivel_ensino"
                      name="nivel_ensino"
                      value={turma.nivel_ensino || 'fundamental'}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="fundamental">Ensino Fundamental</option>
                      <option value="medio">Ensino Medio</option>
                      <option value="tecnico">Curso Tecnico</option>
                      <option value="profissionalizante">Curso Profissionalizante</option>
                    </select>
                    {errors.nivel_ensino && (
                      <div className="invalid-feedback">
                        {errors.nivel_ensino}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="professor_id" className="form-label text-white">
                      Professor (opcional)
                    </label>
                    <select
                      className={`form-select ${errors.professor ? 'is-invalid' : ''}`}
                      id="professor_id"
                      name="professor_id"
                      value={String(turma.professor_id || '')}
                      onChange={handleChange}
                      disabled={saving}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="">Sem professor vinculado</option>
                      {professores.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nome} ({prof.email}){prof.matricula ? ` - Matricula ${prof.matricula}` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.professor && (
                      <div className="invalid-feedback">{errors.professor}</div>
                    )}
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label htmlFor="data_inicio" className="form-label text-white">
                        Data de Inicio: {exigeDatas ? <span className="text-danger">*</span> : <span>(opcional)</span>}
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.data_inicio ? 'is-invalid' : ''}`}
                        id="data_inicio"
                        name="data_inicio"
                        value={turma.data_inicio || ''}
                        onChange={handleChange}
                        required={exigeDatas}
                        disabled={saving || !exigeDatas}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      {errors.data_inicio && (
                        <div className="invalid-feedback">{errors.data_inicio}</div>
                      )}
                      {!exigeDatas && (
                        <small className="text-secondary">Para turma-disciplina de ensino fundamental/medio, as datas usam o periodo da turma base.</small>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="data_fim" className="form-label text-white">
                        Data de Termino: {exigeDatas ? <span className="text-danger">*</span> : <span>(opcional)</span>}
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.data_fim ? 'is-invalid' : ''}`}
                        id="data_fim"
                        name="data_fim"
                        value={turma.data_fim || ''}
                        onChange={handleChange}
                        required={exigeDatas}
                        disabled={saving || !exigeDatas}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      {errors.data_fim && (
                        <div className="invalid-feedback">{errors.data_fim}</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <Link to="/turmas" className="btn btn-outline-secondary">
                      <i className="bi bi-x-circle me-1"></i>
                      Cancelar
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-1"></i>
                          Salvar Alterações
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

export default TurmaEdit;
