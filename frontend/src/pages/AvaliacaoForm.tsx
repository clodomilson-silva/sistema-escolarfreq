import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../services/api';
import { Avaliacao, Turma } from '../types';

const AvaliacaoForm = () => {
  const navigate = useNavigate();
  const { turmaId } = useParams<{ turmaId: string }>();
  
  const [formData, setFormData] = useState<Partial<Avaliacao>>({
    turma: turmaId || '',
    descricao: '',
    tipo: 'prova',
    data: '',
    peso: 1.0,
    nota_maxima: 10.0,
    observacoes: ''
  });
  
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    try {
      const response = await axios.get('/turmas/');
      if (response.data.success) {
        // Filtrar apenas turmas-disciplina
        const turmasDisciplina = response.data.data.filter(
          (t: Turma) => t.tipo === 'disciplina'
        );
        setTurmas(turmasDisciplina);
      }
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
      setError('Erro ao carregar turmas');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'peso' || name === 'nota_maxima' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/turmas/avaliacoes/', formData);
      if (response.data.success) {
        const avaliacaoId = response.data.data.id;
        alert('Avaliação criada com sucesso! Agora você pode lançar as notas.');
        // Redirecionar para a página de lançamento de notas com a avaliação pré-selecionada
        navigate(`/turmas/${formData.turma}/notas?avaliacaoId=${avaliacaoId}`);
      }
    } catch (err) {
      console.error('Erro ao criar avaliação:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erro ao criar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-8 offset-lg-2">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-clipboard-check me-2"></i>
                Nova Avaliação
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="turma" className="form-label">
                    Turma-Disciplina <span className="text-danger">*</span>
                  </label>
                  <select
                    id="turma"
                    name="turma"
                    className="form-select"
                    value={formData.turma}
                    onChange={handleChange}
                    required
                    disabled={!!turmaId}
                  >
                    <option value="">Selecione uma turma-disciplina</option>
                    {turmas.map(turma => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.disciplina}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Apenas turmas-disciplina são listadas
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="descricao" className="form-label">
                    Descrição <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="descricao"
                    name="descricao"
                    className="form-control"
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Prova Bimestral de Matemática"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="tipo" className="form-label">
                      Tipo <span className="text-danger">*</span>
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      className="form-select"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="prova">Prova</option>
                      <option value="trabalho">Trabalho</option>
                      <option value="atividade">Atividade</option>
                      <option value="projeto">Projeto</option>
                      <option value="seminario">Seminário</option>
                      <option value="participacao">Participação</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="data" className="form-label">
                      Data <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="data"
                      name="data"
                      className="form-control"
                      value={formData.data}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="peso" className="form-label">
                      Peso <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="peso"
                      name="peso"
                      className="form-control"
                      value={formData.peso}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                    />
                    <small className="text-muted">
                      Peso da avaliação no cálculo da média
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="nota_maxima" className="form-label">
                      Nota Máxima <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="nota_maxima"
                      name="nota_maxima"
                      className="form-control"
                      value={formData.nota_maxima}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="observacoes" className="form-label">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    className="form-control"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Informações adicionais sobre a avaliação..."
                  />
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2 me-2"></i>
                        Salvar Avaliação
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
  );
};

export default AvaliacaoForm;
