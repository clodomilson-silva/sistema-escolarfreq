import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface Professor {
  id: string;
  nome: string;
  email: string;
  matricula?: string | null;
  telefone?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  disciplinas?: string[];
  is_active: boolean;
  role?: 'professor' | 'supervisor';
}

export default function ProfessoresList() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoProfessorId, setEditandoProfessorId] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'professor' | 'supervisor'>('professor');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    senha: '',
    disciplinas: '',
    role: 'professor' as 'professor' | 'supervisor',
  });

  const [editFormData, setEditFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    senha: '',
    disciplinas: '',
    role: 'professor' as 'professor' | 'supervisor',
  });

  const carregarProfessores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users/');
      const payload = response.data;
      const users = Array.isArray(payload) ? payload : payload?.results || payload?.data || [];
      const professoresFiltrados = users.filter((u: { role?: string }) => u.role === 'professor' || u.role === 'supervisor');
      setProfessores(professoresFiltrados);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      alert('Erro ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProfessores();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: abaAtiva }));
  }, [abaAtiva]);

  const cadastrarProfessor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.matricula || !formData.senha) {
      alert('Preencha os campos obrigatorios');
      return;
    }

    try {
      setSaving(true);
      await api.post('/auth/register/', {
        nome: formData.nome,
        email: formData.email,
        matricula: formData.matricula,
        telefone: formData.telefone || null,
        data_nascimento: formData.data_nascimento || null,
        endereco: formData.endereco || null,
        senha: formData.senha,
        role: formData.role,
        disciplinas: formData.disciplinas
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      });

      setFormData({
        nome: '',
        email: '',
        matricula: '',
        telefone: '',
        data_nascimento: '',
        endereco: '',
        senha: '',
        disciplinas: '',
        role: 'professor'
      });
      await carregarProfessores();
      alert('Usuario cadastrado com sucesso');
    } catch (error) {
      console.error('Erro ao cadastrar professor:', error);
      alert('Erro ao cadastrar professor');
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (professor: Professor) => {
    try {
      await api.patch(`/auth/users/${professor.id}/`, {
        is_active: !professor.is_active,
      });
      await carregarProfessores();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do professor');
    }
  };

  const iniciarEdicao = (professor: Professor) => {
    setEditandoProfessorId(professor.id);
    setEditFormData({
      nome: professor.nome || '',
      email: professor.email || '',
      matricula: professor.matricula || '',
      telefone: professor.telefone || '',
      data_nascimento: professor.data_nascimento || '',
      endereco: professor.endereco || '',
      senha: '',
      disciplinas: (professor.disciplinas || []).join(', '),
      role: professor.role || 'professor',
    });
  };

  const cancelarEdicao = () => {
    setEditandoProfessorId(null);
    setEditFormData({
      nome: '',
      email: '',
      matricula: '',
      telefone: '',
      data_nascimento: '',
      endereco: '',
      senha: '',
      disciplinas: '',
      role: 'professor'
    });
  };

  const salvarEdicao = async (professorId: string) => {
    if (!editFormData.nome || !editFormData.email || !editFormData.matricula) {
      alert('Nome, email e matricula sao obrigatorios.');
      return;
    }

    if (editFormData.senha && editFormData.senha.length < 6) {
      alert('A nova senha deve ter no minimo 6 caracteres.');
      return;
    }

    try {
      setSaving(true);
      await api.patch(`/auth/users/${professorId}/`, {
        nome: editFormData.nome,
        email: editFormData.email,
        matricula: editFormData.matricula,
        telefone: editFormData.telefone || null,
        data_nascimento: editFormData.data_nascimento || null,
        endereco: editFormData.endereco || null,
        senha: editFormData.senha || undefined,
        role: editFormData.role,
        disciplinas: editFormData.disciplinas
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      });

      cancelarEdicao();
      await carregarProfessores();
      alert('Usuario atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      alert('Erro ao atualizar professor');
    } finally {
      setSaving(false);
    }
  };

  const usuariosFiltrados = professores.filter((p) => (p.role || 'professor') === abaAtiva);
  const totalProfessores = professores.filter((p) => (p.role || 'professor') === 'professor').length;
  const totalSupervisores = professores.filter((p) => (p.role || 'professor') === 'supervisor').length;

  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }}>Gerenciar Professores e Supervisores</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Cadastro com email, senha e dados pessoais</p>
          </div>
          <Link to="/home" className="btn btn-outline-secondary">
            <i className="bi bi-house-door me-2"></i>Voltar
          </Link>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn ${abaAtiva === 'professor' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setAbaAtiva('professor')}
              >
                Professores ({totalProfessores})
              </button>
              <button
                type="button"
                className={`btn ${abaAtiva === 'supervisor' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setAbaAtiva('supervisor')}
              >
                Supervisores ({totalSupervisores})
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Cadastrar {abaAtiva === 'professor' ? 'Professor' : 'Supervisor'}</h5>
            <form onSubmit={cadastrarProfessor}>
              <div className="row g-3">
                <div className="col-md-4">
                  <input className="form-control" placeholder="Nome *" value={formData.nome} onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <input className="form-control" type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <input className="form-control" placeholder="Matricula *" value={formData.matricula} onChange={(e) => setFormData((p) => ({ ...p, matricula: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" placeholder="Telefone" value={formData.telefone} onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="date" placeholder="Data de nascimento" value={formData.data_nascimento} onChange={(e) => setFormData((p) => ({ ...p, data_nascimento: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" placeholder="Endereco" value={formData.endereco} onChange={(e) => setFormData((p) => ({ ...p, endereco: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="password" placeholder="Senha *" value={formData.senha} onChange={(e) => setFormData((p) => ({ ...p, senha: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as 'professor' | 'supervisor' }))}
                  >
                    <option value="professor">Professor</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input className="form-control" placeholder="Disciplinas (separadas por virgula)" value={formData.disciplinas} onChange={(e) => setFormData((p) => ({ ...p, disciplinas: e.target.value }))} />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : `Cadastrar ${formData.role === 'professor' ? 'Professor' : 'Supervisor'}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="mb-3">{abaAtiva === 'professor' ? 'Professores' : 'Supervisores'} Cadastrados</h5>
            {loading ? (
              <div>Carregando...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Matricula</th>
                      <th>Perfil</th>
                      <th>Status</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {editandoProfessorId === p.id ? (
                            <input
                              className="form-control form-control-sm"
                              value={editFormData.nome}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, nome: e.target.value }))}
                            />
                          ) : (
                            p.nome
                          )}
                        </td>
                        <td>
                          {editandoProfessorId === p.id ? (
                            <input
                              className="form-control form-control-sm"
                              type="email"
                              value={editFormData.email}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                            />
                          ) : (
                            p.email
                          )}
                        </td>
                        <td>
                          {editandoProfessorId === p.id ? (
                            <input
                              className="form-control form-control-sm"
                              value={editFormData.matricula}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, matricula: e.target.value }))}
                            />
                          ) : (
                            p.matricula || '-'
                          )}
                        </td>
                        <td>
                          {editandoProfessorId === p.id ? (
                            <select
                              className="form-select form-select-sm"
                              value={editFormData.role}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, role: e.target.value as 'professor' | 'supervisor' }))}
                            >
                              <option value="professor">Professor</option>
                              <option value="supervisor">Supervisor</option>
                            </select>
                          ) : (
                            p.role === 'supervisor' ? 'Supervisor' : 'Professor'
                          )}
                        </td>
                        <td>
                          <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {p.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {editandoProfessorId === p.id ? (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => salvarEdicao(p.id)} disabled={saving}>
                                  Salvar
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={cancelarEdicao} disabled={saving}>
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => iniciarEdicao(p)}>
                                  Editar
                                </button>
                                <button className="btn btn-sm btn-outline-warning" onClick={() => alternarStatus(p)}>
                                  {p.is_active ? 'Inativar' : 'Ativar'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuariosFiltrados.length === 0 && (
                  <div className="text-center py-3 text-secondary">
                    Nenhum {abaAtiva === 'professor' ? 'professor' : 'supervisor'} cadastrado.
                  </div>
                )}
                {editandoProfessorId && (
                  <div className="mt-3 p-3 border rounded">
                    <h6>Campos adicionais da edicao</h6>
                    <div className="row g-2">
                      <div className="col-md-3">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Telefone"
                          value={editFormData.telefone}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          className="form-control form-control-sm"
                          type="date"
                          placeholder="Data de nascimento"
                          value={editFormData.data_nascimento}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, data_nascimento: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Endereco"
                          value={editFormData.endereco}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, endereco: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          className="form-control form-control-sm"
                          type="password"
                          placeholder="Nova senha (opcional)"
                          value={editFormData.senha}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, senha: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-12">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Disciplinas (separadas por virgula)"
                          value={editFormData.disciplinas}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, disciplinas: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
