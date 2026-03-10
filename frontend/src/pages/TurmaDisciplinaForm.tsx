import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Turma } from '../types';

const TurmaDisciplinaForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [turmasBase, setTurmasBase] = useState<Turma[]>([]);
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

  useEffect(() => {
    carregarTurmasBase();
  }, []);

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

      // Criar turma-disciplina (alunos são copiados automaticamente no backend)
      const turmaDisciplina = {
        nome: `${turmaBase.nome} - ${formData.disciplina}`,
        ano: turmaBase.ano,
        turno: turmaBase.turno,
        tipo: 'disciplina' as const,
        turma_base_id: parseInt(formData.turma_base_id),
        disciplina: formData.disciplina,
        professor: formData.professor_nome,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
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
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  📚 Criar Turma-Disciplina
                </h4>
                <p className="mb-0 mt-2 small">
                  Crie uma turma vinculada a uma disciplina/unidade curricular específica
                </p>
              </div>
              <div className="card-body p-4">
                {erro && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Erro!</strong> {erro}
                    <button type="button" className="btn-close" onClick={() => setErro('')}></button>
                  </div>
                )}

                {sucesso && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Sucesso!</strong> {sucesso}
                    <button type="button" className="btn-close" onClick={() => setSucesso('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Turma Base */}
                  <div className="mb-4">
                    <label htmlFor="turma_base_id" className="form-label fw-bold">
                      🏫 Turma Base *
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
                          {turma.nome} - {turma.ano} ({turma.turno}) - {turma.alunos?.length || 0} alunos
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Selecione a turma principal da escola onde os alunos estão matriculados
                    </div>
                  </div>

                  {/* Disciplina */}
                  <div className="mb-4">
                    <label htmlFor="disciplina" className="form-label fw-bold">
                      📖 Disciplina / Unidade Curricular *
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
                      👨‍🏫 Nome do Professor *
                    </label>
                    <input
                      type="text"
                      id="professor_nome"
                      name="professor_nome"
                      className="form-control form-control-lg"
                      value={formData.professor_nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  {/* Carga Horária */}
                  <div className="mb-4">
                    <label htmlFor="carga_horaria" className="form-label fw-bold">
                      ⏰ Carga Horária (horas) *
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
                        📅 Data de Início *
                      </label>
                      <input
                        type="date"
                        id="data_inicio"
                        name="data_inicio"
                        className="form-control form-control-lg"
                        value={formData.data_inicio}
                        onChange={handleChange}
                        required
                      />
                      <div className="form-text">
                        Data de início do semestre/período letivo
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="data_fim" className="form-label fw-bold">
                        📅 Data de Término *
                      </label>
                      <input
                        type="date"
                        id="data_fim"
                        name="data_fim"
                        className="form-control form-control-lg"
                        value={formData.data_fim}
                        onChange={handleChange}
                        required
                      />
                      <div className="form-text">
                        Data de término do semestre/período letivo
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="mb-4">
                    <label htmlFor="descricao" className="form-label fw-bold">
                      📝 Descrição (Opcional)
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
                  <div className="alert alert-info">
                    <h6 className="alert-heading">ℹ️ Informações importantes:</h6>
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
                      ❌ Cancelar
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
                        <>✅ Criar Turma-Disciplina</>
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
