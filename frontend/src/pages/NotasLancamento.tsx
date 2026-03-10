import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import { Avaliacao, Nota, Aluno, Turma } from '../types';

const NotasLancamento = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const [searchParams] = useSearchParams();
  const avaliacaoIdParam = searchParams.get('avaliacaoId');
  const navigate = useNavigate();
  
  const [turma, setTurma] = useState<Turma | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<Avaliacao | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]); // Inicializa como array vazio
  const [notas, setNotas] = useState<Record<string, { valor: string; observacoes: string }>>({});
  const [notasExistentes, setNotasExistentes] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (turmaId) {
      fetchTurma();
      fetchAvaliacoes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId]);

  useEffect(() => {
    if (avaliacaoSelecionada) {
      fetchNotasExistentes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avaliacaoSelecionada]);

  // Log de debug quando avaliacaoSelecionada mudar
  useEffect(() => {
    console.log('==== ESTADO ATUALIZADO ====');
    console.log('avaliacaoSelecionada:', avaliacaoSelecionada);
    console.log('alunos.length:', alunos.length);
    console.log('alunos:', alunos);
  }, [avaliacaoSelecionada, alunos]);

  const fetchTurma = async () => {
    try {
      const response = await axios.get(`/turmas/${turmaId}/`);
      if (response.data.success) {
        const turmaData = response.data.data;
        setTurma(turmaData);
        
        console.log('Turma carregada:', turmaData);
        console.log('Alunos recebidos:', turmaData.alunos);
        
        // Processar lista de alunos
        if (Array.isArray(turmaData.alunos) && turmaData.alunos.length > 0) {
          const primeiroAluno = turmaData.alunos[0];
          
          // Se o primeiro aluno é um objeto com 'id', são objetos de aluno completos
          if (primeiroAluno && typeof primeiroAluno === 'object' && 'id' in primeiroAluno) {
            console.log('Alunos são objetos completos');
            setAlunos(turmaData.alunos);
          } 
          // Se são strings ou números, são apenas IDs
          else {
            console.log('Alunos são IDs, buscando detalhes...');
            fetchAlunosDetalhados(turmaData.alunos);
          }
        } else {
          console.log('Nenhum aluno matriculado na turma');
          setAlunos([]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar turma:', err);
      setError('Erro ao carregar dados da turma');
    }
  };

  const fetchAlunosDetalhados = async (alunoIds: string[]) => {
    try {
      console.log('Buscando detalhes de alunos com IDs:', alunoIds);
      const promises = alunoIds.map(id => axios.get(`/alunos/${id}/`));
      const responses = await Promise.all(promises);
      const alunosData = responses.map(r => r.data.data);
      console.log('Alunos detalhados carregados:', alunosData);
      setAlunos(alunosData);
    } catch (err) {
      console.error('Erro ao buscar detalhes dos alunos:', err);
      setError('Erro ao carregar detalhes dos alunos');
    }
  };

  const fetchAvaliacoes = async () => {
    setLoading(true);
    try {
      console.log('🔍 Buscando avaliações para turma:', turmaId);
      const response = await axios.get(`/turmas/avaliacoes/?turma_id=${turmaId}`);
      console.log('📥 Resposta de avaliações:', response.data);
      
      if (response.data.success) {
        const avaliacoesData = response.data.data;
        console.log('✅ Avaliações carregadas:', avaliacoesData);
        console.log('📊 Quantidade de avaliações:', avaliacoesData.length);
        setAvaliacoes(avaliacoesData);
        
        // Se houver avaliacaoId na URL, pré-selecionar essa avaliação
        if (avaliacaoIdParam) {
          console.log('Pré-selecionando avaliação ID:', avaliacaoIdParam);
          const avaliacaoPreSelecionada = avaliacoesData.find(
            (a: Avaliacao) => String(a.id) === String(avaliacaoIdParam)
          );
          if (avaliacaoPreSelecionada) {
            console.log('Avaliação pré-selecionada:', avaliacaoPreSelecionada);
            setAvaliacaoSelecionada(avaliacaoPreSelecionada);
          } else {
            console.log('Avaliação não encontrada com ID:', avaliacaoIdParam);
          }
        }
      } else {
        console.error('❌ API retornou success: false');
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotasExistentes = async () => {
    if (!avaliacaoSelecionada) return;
    
    try {
      const response = await axios.get(`/turmas/notas/?avaliacao_id=${avaliacaoSelecionada.id}`);
      if (response.data.success) {
        const notasData = response.data.data;
        setNotasExistentes(notasData);
        
        // Preencher o estado de notas com as notas existentes
        const notasMap: Record<string, { valor: string; observacoes: string }> = {};
        notasData.forEach((nota: Nota) => {
          notasMap[nota.aluno] = {
            valor: nota.valor.toString(),
            observacoes: nota.observacoes || ''
          };
        });
        setNotas(notasMap);
      }
    } catch (err) {
      console.error('Erro ao buscar notas existentes:', err);
    }
  };

  const handleAvaliacaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const avaliacaoId = e.target.value;
    console.log('Avaliação selecionada - ID:', avaliacaoId);
    console.log('Array de avaliações disponíveis:', avaliacoes);
    console.log('Quantidade de avaliações:', avaliacoes.length);
    
    // Converter ambos para string para  garantir comparação correta
    const avaliacao = avaliacoes.find(a => String(a.id) === String(avaliacaoId));
    console.log('Avaliação encontrada:', avaliacao);
    console.log('Alunos disponíveis:', alunos.length);
    
    setAvaliacaoSelecionada(avaliacao || null);
    setNotas({});
    setNotasExistentes([]);
  };

  const handleNotaChange = (alunoId: string, field: 'valor' | 'observacoes', value: string) => {
    setNotas(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [field]: value
      }
    }));
  };

  const handleSalvarNotas = async () => {
    if (!avaliacaoSelecionada) return;
    
    setSalvando(true);
    setError('');
    setSuccess('');

    try {
      // Preparar dados para envio em batch
      const notasArray = Object.entries(notas)
        .filter(([, data]) => data.valor !== '')
        .map(([alunoId, data]) => ({
          aluno_id: alunoId,
          valor: data.valor,
          observacoes: data.observacoes
        }));

      if (notasArray.length === 0) {
        setError('Nenhuma nota foi preenchida');
        setSalvando(false);
        return;
      }

      const response = await axios.post('/turmas/notas/batch_create/', {
        avaliacao: avaliacaoSelecionada.id,
        notas: notasArray
      });

      if (response.data.success) {
        setSuccess(`${response.data.data.total_processadas} nota(s) salva(s) com sucesso!`);
        if (response.data.data.total_erros > 0) {
          setError(`Atenção: ${response.data.data.total_erros} erro(s) encontrado(s)`);
        }
        fetchNotasExistentes();
      }
    } catch (err) {
      console.error('Erro ao salvar notas:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erro ao salvar notas');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                <i className="bi bi-journal-text me-2"></i>
                Lançamento de Notas
              </h4>
              {turma && (
                <small className="d-block mt-1">
                  Turma: {turma.nome} - {turma.disciplina}
                </small>
              )}
            </div>
            <button
              className="btn btn-light btn-sm"
              onClick={() => navigate(`/turmas/${turmaId}`)}
              title="Voltar aos detalhes da turma"
            >
              <i className="bi bi-arrow-left me-1"></i>
              Voltar
            </button>
          </div>
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

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {success}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() =>setSuccess('')}
              ></button>
            </div>
          )}

          {/* Seleção de Avaliação */}
          <div className="mb-4">
            <label htmlFor="avaliacao" className="form-label fw-bold">
              <i className="bi bi-clipboard-check me-2"></i>
              Selecione a Avaliação
            </label>
            <select
              id="avaliacao"
              className="form-select"
              value={avaliacaoSelecionada?.id || ''}
              onChange={handleAvaliacaoChange}
              disabled={loading}
            >
              <option value="">Selecione uma avaliação...</option>
              {avaliacoes.map(avaliacao => (
                <option key={avaliacao.id} value={avaliacao.id}>
                  {avaliacao.descricao} ({avaliacao.tipo}) - {new Date(avaliacao.data).toLocaleDateString('pt-BR')} - Peso: {avaliacao.peso} - Máx: {avaliacao.nota_maxima}
                </option>
              ))}
            </select>
          </div>

          {avaliacaoSelecionada ? (
            <>
              {/* Card com informações da avaliação */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Tipo:</strong> {avaliacaoSelecionada.tipo}
                    </div>
                    <div className="col-md-3">
                      <strong>Data:</strong> {new Date(avaliacaoSelecionada.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="col-md-3">
                      <strong>Peso:</strong> {avaliacaoSelecionada.peso}
                    </div>
                    <div className="col-md-3">
                      <strong>Nota Máxima:</strong> {avaliacaoSelecionada.nota_maxima}
                    </div>
                  </div>
                  {avaliacaoSelecionada.observacoes && (
                    <div className="mt-2">
                      <strong>Observações:</strong> {avaliacaoSelecionada.observacoes}
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de debug - mostra quantidade de alunos */}
              <div className="alert alert-info mb-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Debug:</strong> {alunos.length} aluno(s) carregado(s) | 
                Turma ID: {turmaId} | 
                Avaliação ID: {avaliacaoSelecionada.id}
              </div>

              {/* Tabela de lançamento de notas */}
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '40%' }}>Aluno</th>
                      <th style={{ width: '15%' }}>Matrícula</th>
                      <th style={{ width: '15%' }}>Nota</th>
                      <th style={{ width: '30%' }}>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          Nenhum aluno matriculado nesta turma
                        </td>
                      </tr>
                    ) : (
                      alunos.map(aluno => (
                        <tr key={aluno.id}>
                          <td>
                            <i className="bi bi-person-circle me-2"></i>
                            {aluno.nome}
                          </td>
                          <td>{aluno.matricula}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={notas[aluno.id]?.valor || ''}
                              onChange={(e) => handleNotaChange(aluno.id, 'valor', e.target.value)}
                              min="0"
                              max={avaliacaoSelecionada.nota_maxima}
                              step="0.1"
                              placeholder="0.0"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={notas[aluno.id]?.observacoes || ''}
                              onChange={(e) => handleNotaChange(aluno.id, 'observacoes', e.target.value)}
                              placeholder="Observações..."
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botões de ação */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleSalvarNotas}
                  disabled={salvando || alunos.length === 0}
                >
                  {salvando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Salvar Notas
                    </>
                  )}
                </button>
              </div>

              {/* Estatísticas */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="bi bi-graph-up me-2"></i>
                  Estatísticas
                </h6>
                <div className="row">
                  <div className="col-md-4">
                    <strong>Total de Alunos:</strong> {alunos.length}
                  </div>
                  <div className="col-md-4">
                    <strong>Notas Lançadas:</strong> {notasExistentes.length}
                  </div>
                  <div className="col-md-4">
                    <strong>Pendentes:</strong> {alunos.length - notasExistentes.length}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Selecione uma avaliação acima para lançar as notas.
            </div>
          )}

          {avaliacoes.length === 0 && !loading && (
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Nenhuma avaliação cadastrada para esta turma. Crie uma avaliação primeiro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotasLancamento;
