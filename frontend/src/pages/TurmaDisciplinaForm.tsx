import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Turma } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ProfessorOption {
  id: string;
  nome: string;
  email: string;
}

const TurmaDisciplinaForm: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [turmasBase, setTurmasBase] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<ProfessorOption[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formData, setFormData] = useState({
    turma_base_id: '',
    disciplina: '',
    professor_nome: '',
    carga_horaria: '',
    descricao: '',
    data_inicio: '',
    data_fim: ''
  });

  const turmaBaseSelecionada = useMemo(
    () => turmasBase.find((t) => String(t.id) === String(formData.turma_base_id)),
    [turmasBase, formData.turma_base_id]
  );

  const exigeDatasDisciplina =
    turmaBaseSelecionada?.nivel_ensino === 'tecnico' ||
    turmaBaseSelecionada?.nivel_ensino === 'profissionalizante';

  useEffect(() => {
    if (!exigeDatasDisciplina && (formData.data_inicio || formData.data_fim)) {
      setFormData((prev) => ({ ...prev, data_inicio: '', data_fim: '' }));
    }
  }, [exigeDatasDisciplina, formData.data_inicio, formData.data_fim]);

  useEffect(() => {
    carregarTurmasBase();
  }, []);

  useEffect(() => {
    if (admin?.role === 'admin') {
      carregarProfessores();
    }
  }, [admin?.role]);

  const carregarTurmasBase = async () => {
    try {
      const response = await api.get('/turmas/');
      // Filtrar apenas turmas base (não disciplinas)
      const turmasBase = response.data.data.filter((t: Turma) => !t.tipo || t.tipo === 'base');
      setTurmasBase(turmasBase);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      setErro('Erro ao carregar turmas base');
    }
  };

  const carregarProfessores = async () => {
    try {
      const response = await api.get('/auth/users/');
      const payload = response.data;
      const users = Array.isArray(payload)
        ? payload
        : payload?.results || payload?.data || [];

      const professoresFormatados = users
        .filter((u: { role?: string }) => u.role === 'professor')
        .map((u: { id: string; nome: string; email: string }) => ({
          id: String(u.id),
          nome: u.nome,
          email: u.email
        }));

      setProfessores(professoresFormatados);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      // Validar se turma base foi selecionada
      if (!formData.turma_base_id) {
        throw new Error('Selecione uma turma base');
      }

      // Buscar dados da turma base (converter IDs para string para comparação)
      const turmaBase = turmasBase.find(t => String(t.id) === String(formData.turma_base_id));
      if (!turmaBase) {
        console.error('Turma base não encontrada. ID buscado:', formData.turma_base_id);
        console.error('Turmas disponíveis:', turmasBase.map(t => ({ id: t.id, nome: t.nome })));
        throw new Error('Turma base não encontrada');
      }

      if (exigeDatasDisciplina) {
        if (!formData.data_inicio || !formData.data_fim) {
          throw new Error('Para cursos tecnicos/profissionalizantes, informe data de inicio e termino da disciplina');
        }
        if (new Date(formData.data_inicio) > new Date(formData.data_fim)) {
          throw new Error('A data de termino deve ser maior ou igual a data de inicio');
        }
      }

      // Criar turma-disciplina (alunos são copiados automaticamente no backend)
      const turmaDisciplina = {
        nome: `${turmaBase.nome} - ${formData.disciplina}`,
        ano: turmaBase.ano,
        turno: turmaBase.turno,
        tipo: 'disciplina' as const,
        nivel_ensino: turmaBase.nivel_ensino,
        turma_base_id: parseInt(formData.turma_base_id),
        disciplina: formData.disciplina,
        professor: formData.professor_nome,
        data_inicio: exigeDatasDisciplina ? formData.data_inicio : null,
        data_fim: exigeDatasDisciplina ? formData.data_fim : null,
        status: 'ativa' as const
      };

      await api.post('/turmas/', turmaDisciplina);
      
      setSucesso('Turma-disciplina criada com sucesso!');
      setTimeout(() => {
        navigate('/turmas');
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar turma-disciplina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar turma-disciplina';
      setErro(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
                <h4 className="mb-0">
                  <i className="bi bi-journal-check me-2"></i>Criar Turma-Disciplina
                </h4>
                <p className="mb-0 mt-2 small">
                  Crie uma turma vinculada a uma disciplina/unidade curricular específica
                </p>
              </div>
              <div className="card-body p-4" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {erro && (
                  <div className="alert alert-dismissible fade show" role="alert" style={{ background: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-color)' }}>
                    <strong>Erro!</strong> {erro}
                    <button type="button" className="btn-close" onClick={() => setErro('')}></button>
                  </div>
                )}

                {sucesso && (
                  <div className="alert alert-dismissible fade show" role="alert" style={{ background: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-color)' }}>
                    <strong>Sucesso!</strong> {sucesso}
                    <button type="button" className="btn-close" onClick={() => setSucesso('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Turma Base */}
                  <div className="mb-4">
                    <label htmlFor="turma_base_id" className="form-label fw-bold">
                      Turma Base *
                    </label>
                    <select
                      id="turma_base_id"
                      name="turma_base_id"
                      className="form-select form-select-lg"
                      value={formData.turma_base_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione a turma base...</option>
                      {turmasBase.map(turma => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome} - {turma.ano} ({turma.turno}) - {turma.total_alunos ?? turma.alunos?.length ?? 0} alunos
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Selecione a turma principal da escola onde os alunos estão matriculados
                    </div>
                    {turmaBaseSelecionada?.nivel_ensino && (
                      <div className="form-text mt-1">
                        Nivel de ensino da turma base: <strong>{turmaBaseSelecionada.nivel_ensino}</strong>
                      </div>
                    )}
                  </div>

                  {/* Disciplina */}
                  <div className="mb-4">
                    <label htmlFor="disciplina" className="form-label fw-bold">
                      Disciplina / Unidade Curricular *
                    </label>
                    <input
                      type="text"
                      id="disciplina"
                      name="disciplina"
                      className="form-control form-control-lg"
                      value={formData.disciplina}
                      onChange={handleChange}
                      placeholder="Ex: Matemática, Língua Portuguesa, Programação Web..."
                      required
                    />
                    <div className="form-text">
                      Nome da disciplina ou unidade curricular que você ministra
                    </div>
                  </div>

                  {/* Professor */}
                  <div className="mb-4">
                    <label htmlFor="professor_nome" className="form-label fw-bold">
                      Professor (opcional)
                    </label>
                    {admin?.role === 'admin' && professores.length > 0 ? (
                      <select
                        id="professor_nome"
                        name="professor_nome"
                        className="form-select form-select-lg"
                        value={formData.professor_nome}
                        onChange={handleChange}
                      >
                        <option value="">Selecione um professor...</option>
                        {professores.map((prof) => (
                          <option key={prof.id} value={prof.nome}>
                            {prof.nome} ({prof.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="professor_nome"
                        name="professor_nome"
                        className="form-control form-control-lg"
                        value={formData.professor_nome}
                        onChange={handleChange}
                        placeholder="Nome do professor"
                      />
                    )}
                    <div className="form-text">
                      Pode cadastrar com ou sem professor, independente do tipo da turma.
                    </div>
                  </div>

                  {/* Carga Horária */}
                  <div className="mb-4">
                    <label htmlFor="carga_horaria" className="form-label fw-bold">
                      Carga Horária (horas) *
                    </label>
                    <input
                      type="number"
                      id="carga_horaria"
                      name="carga_horaria"
                      className="form-control form-control-lg"
                      value={formData.carga_horaria}
                      onChange={handleChange}
                      placeholder="Ex: 60, 80, 120..."
                      min="1"
                      required
                    />
                    <div className="form-text">
                      Carga horária total da disciplina
                    </div>
                  </div>

                  {/* Período Letivo */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label htmlFor="data_inicio" className="form-label fw-bold">
                        Data de Inicio {exigeDatasDisciplina ? '*' : '(opcional)'}
                      </label>
                      <input
                        type="date"
                        id="data_inicio"
                        name="data_inicio"
                        className="form-control form-control-lg"
                        value={formData.data_inicio}
                        onChange={handleChange}
                        required={exigeDatasDisciplina}
                        disabled={!exigeDatasDisciplina}
                      />
                      <div className="form-text">
                        {exigeDatasDisciplina
                          ? 'Obrigatoria para turmas de cursos tecnicos/profissionalizantes.'
                          : 'Para ensino fundamental/medio, turma-disciplina nao usa periodo proprio.'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="data_fim" className="form-label fw-bold">
                        Data de Termino {exigeDatasDisciplina ? '*' : '(opcional)'}
                      </label>
                      <input
                        type="date"
                        id="data_fim"
                        name="data_fim"
                        className="form-control form-control-lg"
                        value={formData.data_fim}
                        onChange={handleChange}
                        required={exigeDatasDisciplina}
                        disabled={!exigeDatasDisciplina}
                      />
                      <div className="form-text">
                        {exigeDatasDisciplina
                          ? 'Informe o termino da disciplina/unidade curricular do curso.'
                          : 'Este campo fica desabilitado para ensino fundamental/medio.'}
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="mb-4">
                    <label htmlFor="descricao" className="form-label fw-bold">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      className="form-control"
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Descrição da disciplina, objetivos, conteúdo programático..."
                    />
                  </div>

                  {/* Informação */}
                  <div className="alert" style={{ background: 'var(--info-bg)', color: 'var(--info-color)', border: '1px solid var(--info-color)' }}>
                    <h6 className="alert-heading">Informações importantes:</h6>
                    <ul className="mb-0 small">
                      <li>A turma-disciplina herdará todos os alunos da turma base selecionada</li>
                      <li>Os registros de frequência serão específicos desta disciplina</li>
                      <li>O administrador do sistema pode visualizar todas as turmas-disciplina</li>
                      <li>Você poderá criar múltiplas turmas-disciplina para a mesma turma base</li>
                    </ul>
                  </div>

                  {/* Botões */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate('/turmas')}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Criando...
                        </>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i>Criar Turma-Disciplina</>
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
};

export default TurmaDisciplinaForm;
