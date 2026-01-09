import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './LoginAuth.css';

function RegistroUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    role: 'professor',
    disciplinas: [] as string[]
  });

  const [disciplinaInput, setDisciplinaInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const adicionarDisciplina = () => {
    if (disciplinaInput.trim() && !formData.disciplinas.includes(disciplinaInput.trim())) {
      setFormData({
        ...formData,
        disciplinas: [...formData.disciplinas, disciplinaInput.trim()]
      });
      setDisciplinaInput('');
    }
  };

  const removerDisciplina = (disciplina: string) => {
    setFormData({
      ...formData,
      disciplinas: formData.disciplinas.filter(d => d !== disciplina)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (formData.role === 'professor' && formData.disciplinas.length === 0) {
      setErro('Professores devem informar pelo menos uma disciplina');
      return;
    }

    setLoading(true);

    try {
      const { confirmarSenha: _, ...dadosRegistro } = formData;
      
      await api.post('/auth/register', dadosRegistro);
      
      setSucesso('Usuário cadastrado com sucesso! Redirecionando para login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
          };
        };
        setErro(axiosError.response?.data?.message || 'Erro ao criar usuário');
      } else {
        setErro('Erro ao criar usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">📝 Cadastro de Usuário</h2>
                  <p className="text-muted">Crie sua conta no Ponto Class</p>
                </div>

                {erro && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Erro!</strong> {erro}
                    <button type="button" className="btn-close" onClick={() => setErro('')}></button>
                  </div>
                )}

                {sucesso && (
                  <div className="alert alert-success" role="alert">
                    <strong>Sucesso!</strong> {sucesso}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Nome */}
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label fw-bold">
                      👤 Nome Completo
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      className="form-control form-control-lg"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="seu.email@exemplo.com"
                    />
                  </div>

                  {/* Tipo de Usuário */}
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label fw-bold">
                      🎭 Tipo de Usuário
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="form-select form-select-lg"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="professor">👨‍🏫 Professor</option>
                      <option value="admin">👑 Administrador</option>
                    </select>
                    <div className="form-text">
                      {formData.role === 'professor' 
                        ? 'Professores podem criar turmas-disciplina e registrar frequência'
                        : 'Administradores têm acesso total ao sistema'}
                    </div>
                  </div>

                  {/* Disciplinas (apenas para professor) */}
                  {formData.role === 'professor' && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        📚 Disciplinas que Ministra
                      </label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={disciplinaInput}
                          onChange={(e) => setDisciplinaInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarDisciplina())}
                          placeholder="Ex: Matemática, Programação Web..."
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={adicionarDisciplina}
                        >
                          ➕ Adicionar
                        </button>
                      </div>
                      {formData.disciplinas.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {formData.disciplinas.map((disciplina, index) => (
                            <span key={index} className="badge bg-primary fs-6 d-flex align-items-center gap-2">
                              {disciplina}
                              <button
                                type="button"
                                className="btn-close btn-close-white"
                                style={{ fontSize: '0.6rem' }}
                                onClick={() => removerDisciplina(disciplina)}
                              ></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="form-text">
                        Adicione as disciplinas que você ministra (obrigatório para professores)
                      </div>
                    </div>
                  )}

                  {/* Senha */}
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label fw-bold">
                      🔒 Senha
                    </label>
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      className="form-control form-control-lg"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <div className="form-text">
                      Deve conter: maiúscula, minúscula, número e caractere especial
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="mb-4">
                    <label htmlFor="confirmarSenha" className="form-label fw-bold">
                      🔒 Confirmar Senha
                    </label>
                    <input
                      type="password"
                      id="confirmarSenha"
                      name="confirmarSenha"
                      className="form-control form-control-lg"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      required
                      placeholder="Digite a senha novamente"
                    />
                  </div>

                  {/* Botões */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Cadastrando...
                        </>
                      ) : (
                        '✅ Criar Conta'
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-3">
                    <p className="text-muted mb-0">
                      Já tem uma conta?{' '}
                      <Link to="/login" className="text-primary fw-bold">
                        Fazer Login
                      </Link>
                    </p>
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

export default RegistroUsuario;
