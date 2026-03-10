import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { FrequenciaForm } from "./FrequenciaForm";

interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  tipo?: 'base' | 'disciplina';
  disciplina?: string;
  professor?: string;
  data_inicio?: string | null;
  data_fim?: string | null;
  status: 'ativa' | 'inativa' | 'concluida';
  alunos: string[];
  criado_em?: string;
  atualizado_em?: string;
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  data_nascimento: string;
}

interface VerificacaoConclusao {
  pode_concluir: boolean;
  motivos: string[];
  estatisticas: {
    total_alunos: number;
    total_avaliacoes: number;
    notas: {
      cadastradas: number;
      esperadas: number;
      percentual: number;
    };
    frequencias: {
      cadastradas: number;
      esperadas: number;
      percentual: number;
      dias_letivos_estimados: number;
    };
  };
}

function TurmaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [showFrequenciaForm, setShowFrequenciaForm] = useState(false);
  const [verificacaoConclusao, setVerificacaoConclusao] = useState<VerificacaoConclusao | null>(null);
  const [loadingConclusao, setLoadingConclusao] = useState(false);
  const [showConclusaoModal, setShowConclusaoModal] = useState(false);
  const { isReady } = useAuth();

  // Função para mapear turnos do backend para exibição
  const formatarTurno = (turno: string) => {
    const turnoMap: { [key: string]: { label: string; icon: string; color: string } } = {
      'matutino': { label: 'Manhã', icon: 'bi-sunrise', color: 'bg-warning' },
      'vespertino': { label: 'Tarde', icon: 'bi-sun', color: 'bg-info' },
      'noturno': { label: 'Noite', icon: 'bi-moon-stars', color: 'bg-dark' },
      'integral': { label: 'Integral', icon: 'bi-brightness-high', color: 'bg-success' }
    };
    
    return turnoMap[turno] || { label: turno, icon: 'bi-clock', color: 'bg-secondary' };
  };

  useEffect(() => {
    if (isReady && id) {
      carregarDados();
    }
  }, [isReady, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verificar possibilidade de conclusão quando turma carregar
  useEffect(() => {
    if (turma && turma.tipo === 'disciplina' && turma.status !== 'concluida') {
      verificarConclusao();
    }
  }, [turma]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar turma e todos os alunos em paralelo
      const [turmaResponse, alunosResponse] = await Promise.all([
        api.get(`/turmas/${id}/`),
        api.get('/alunos/')
      ]);

      const turmaData = turmaResponse.data.data;
      const todosAlunosData = alunosResponse.data.data || alunosResponse.data;

      setTurma(turmaData);

      // O backend retorna objetos completos de alunos, não apenas IDs
      const alunosDaTurmaData = turmaData.alunos || [];
      
      // Se alunos são objetos, usar diretamente; se são IDs, filtrar da lista
      let alunosDaTurmaFiltrados: Aluno[];
      let alunosIds: string[];
      
      if (alunosDaTurmaData.length > 0 && typeof alunosDaTurmaData[0] === 'object') {
        // Backend retorna objetos completos
        alunosDaTurmaFiltrados = alunosDaTurmaData as Aluno[];
        alunosIds = alunosDaTurmaFiltrados.map((a: Aluno) => String(a.id));
      } else {
        // Backend retorna apenas IDs
        alunosIds = alunosDaTurmaData.map((id: any) => String(id));
        alunosDaTurmaFiltrados = todosAlunosData.filter((aluno: Aluno) => 
          alunosIds.includes(String(aluno.id))
        );
      }
      
      const alunosDisponiveisFiltrados = todosAlunosData.filter((aluno: Aluno) => 
        !alunosIds.includes(String(aluno.id))
      );

      setAlunosDaTurma(alunosDaTurmaFiltrados);
      setAlunosDisponiveis(alunosDisponiveisFiltrados);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da turma!");
    } finally {
      setLoading(false);
    }
  };

  const adicionarAluno = async (alunoId: string) => {
    try {
      setLoadingAlunos(true);
      await api.post(`/turmas/${id}/add_aluno/`, { aluno_id: alunoId });
      await carregarDados(); // Recarregar dados
      alert("Aluno adicionado à turma com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      alert("Erro ao adicionar aluno à turma!");
    } finally {
      setLoadingAlunos(false);
    }
  };

  const removerAluno = async (alunoId: string) => {
    if (window.confirm("Tem certeza que deseja remover este aluno da turma?")) {
      try {
        setLoadingAlunos(true);
        await api.post(`/turmas/${id}/remove_aluno/`, { aluno_id: alunoId });
        await carregarDados(); // Recarregar dados
        alert("Aluno removido da turma com sucesso!");
      } catch (error) {
        console.error("Erro ao remover aluno:", error);
        alert("Erro ao remover aluno da turma!");
      } finally {
        setLoadingAlunos(false);
      }
    }
  };

  const verificarConclusao = async () => {
    try {
      const response = await api.get(`/turmas/${id}/verificar_conclusao/`);
      if (response.data.success) {
        setVerificacaoConclusao(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao verificar conclusão:', error);
    }
  };

  const concluirTurma = async () => {
    try {
      setLoadingConclusao(true);
      const response = await api.post(`/turmas/${id}/concluir/`);
      
      if (response.data.success) {
        alert('Turma concluída com sucesso!');
        setShowConclusaoModal(false);
        await carregarDados(); // Recarregar dados
      }
    } catch (error: any) {
      console.error('Erro ao concluir turma:', error);
      const motivos = error.response?.data?.motivos || ['Erro desconhecido'];
      alert('Não foi possível concluir a turma:\n\n' + motivos.join('\n'));
    } finally {
      setLoadingConclusao(false);
    }
  };

  const podeExibirBotaoConcluir = () => {
    if (!turma || turma.tipo !== 'disciplina' || turma.status === 'concluida') {
      return false;
    }
    
    // Verificar se a data de fim já passou
    if (turma.data_fim) {
      const dataFim = new Date(turma.data_fim);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataFim.setHours(0, 0, 0, 0);
      return dataFim <= hoje;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando dados da turma...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="container py-4">
          <div className="alert alert-danger">
            <h4>Turma não encontrada</h4>
            <p>A turma solicitada não foi encontrada.</p>
            <Link to="/turmas" className="btn btn-primary">
              Voltar para Lista de Turmas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const turnoInfo = formatarTurno(turma.turno);

  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h2 mb-0" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Detalhes da Turma
              </h1>
              <Link to="/turmas" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Voltar para Lista
              </Link>
            </div>
          </div>
        </div>

        {/* Informações da Turma */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-success text-white">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      <i className="bi bi-grid-3x3-gap"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1">{turma.nome}</h3>
                    <p className="mb-0">Informações detalhadas da turma</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-md-3 text-center">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      <i className="bi bi-hash me-1"></i>
                      Número da Turma:
                    </strong>
                    <br />
                    <span className="badge bg-primary fs-6">{turma.ano}</span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      <i className="bi bi-clock me-1"></i>
                      Turno:
                    </strong>
                    <br />
                    <span className={`badge ${turnoInfo.color} fs-6`}>
                      <i className={`${turnoInfo.icon} me-1`}></i>
                      {turnoInfo.label}
                    </span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      <i className="bi bi-people me-1"></i>
                      Total de Alunos:
                    </strong>
                    <br />
                    <span className="badge bg-info fs-6">{alunosDaTurma.length} aluno(s)</span>
                  </div>
                  <div className="col-md-3 text-center">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      <i className="bi bi-calendar3 me-1"></i>
                      Criada em:
                    </strong>
                    <br />
                    <span style={{ color: 'var(--text-muted)' }}>
                      {turma.criado_em ? 
                        (() => {
                          try {
                            const data = new Date(turma.criado_em);
                            return data.toLocaleDateString('pt-BR');
                          } catch {
                            console.error('Erro ao formatar data:', turma.criado_em);
                            return 'Data inválida';
                          }
                        })() : 
                        '-'
                      }
                    </span>
                  </div>
                </div>
                
                {/* Informações específicas para turma-disciplina */}
                {turma.tipo === 'disciplina' && turma.disciplina && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="alert alert-info mb-0 d-flex align-items-center" role="alert">
                        <i className="bi bi-journal-check me-2 fs-4"></i>
                        <div>
                          <strong>
                            <i className="bi bi-journal-check me-1"></i>
                            Disciplina:
                          </strong> {turma.disciplina}
                          <span className="badge bg-primary ms-2">Turma-Disciplina</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Alunos da Turma */}
          <div className="col mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Alunos Matriculados ({alunosDaTurma.length})
                </h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {alunosDaTurma.length === 0 ? (
                  <div className="text-center py-4">
                    <p style={{ color: 'var(--text-muted)' }} className="mb-3">
                      Nenhum aluno matriculado nesta turma
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Adicione alunos usando a lista ao lado
                    </small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {alunosDaTurma.map((aluno) => (
                      <div key={aluno.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{aluno.nome}</h6>
                          <small style={{ color: 'var(--text-muted)' }}>
                            <i className="bi bi-clipboard me-1"></i>
                            {aluno.matricula} • 
                            <i className="bi bi-envelope ms-2 me-1"></i>
                            {aluno.email}
                          </small>
                        </div>
                        <button
                          onClick={() => removerAluno(aluno.id)}
                          className="btn btn-outline-danger btn-sm"
                          disabled={loadingAlunos}
                          title="Remover da turma"
                        >
                          {loadingAlunos ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alunos Disponíveis */}
          <div className="col mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ width: '100%', maxWidth: '100%' }}>
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Adicionar Alunos ({alunosDisponiveis.length})
                </h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {alunosDisponiveis.length === 0 ? (
                  <div className="text-center py-4">
                    <p style={{ color: 'var(--text-muted)' }} className="mb-3">
                      <i className="bi bi-check-circle me-1"></i>
                      Todos os alunos já estão matriculados
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Ou não há alunos cadastrados no sistema
                    </small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {alunosDisponiveis.map((aluno) => (
                      <div key={aluno.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{aluno.nome}</h6>
                          <small style={{ color: 'var(--text-muted)' }}>
                            <i className="bi bi-clipboard me-1"></i>
                            {aluno.matricula} • 
                            <i className="bi bi-envelope ms-2 me-1"></i>
                            {aluno.email}
                          </small>
                        </div>
                        <button
                          onClick={() => adicionarAluno(aluno.id)}
                          className="btn btn-outline-success btn-sm"
                          disabled={loadingAlunos}
                          title="Adicionar à turma"
                        >
                          {loadingAlunos ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-plus-circle"></i>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="row">
          <div className="col-12">
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              {/* Badge de Status */}
              {turma.status === 'concluida' && (
                <span className="badge bg-success fs-5 py-2 px-3">
                  <i className="bi bi-check-circle me-1"></i>
                  Turma Concluída
                </span>
              )}
              
              <button 
                className="btn btn-success"
                onClick={() => setShowFrequenciaForm(true)}
                disabled={alunosDaTurma.length === 0 || turma.status === 'concluida'}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Registrar Frequência
              </button>
              <Link 
                to={`/turmas/${id}/frequencia`} 
                className="btn btn-info"
              >
                <i className="bi bi-bar-chart me-2"></i>
                Dashboard de Frequência
              </Link>
              
              {/* Botões específicos para turmas-disciplina */}
              {turma.tipo === 'disciplina' && (
                <>
                  <Link 
                    to={`/turmas/${id}/avaliacoes/nova`} 
                    className={`btn btn-primary ${turma.status === 'concluida' ? 'disabled' : ''}`}
                    title="Criar nova avaliação para esta disciplina"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Criar Avaliação
                  </Link>
                  <Link 
                    to={`/turmas/${id}/notas`} 
                    className={`btn btn-success ${turma.status === 'concluida' ? 'disabled' : ''}`}
                    title="Lançar notas das avaliações"
                  >
                    <i className="bi bi-clipboard me-2"></i>
                    Lançar Notas
                  </Link>
                  
                  {/* Botão de Conclusão */}
                  {podeExibirBotaoConcluir() && (
                    <button
                      className="btn btn-warning"
                      onClick={() => setShowConclusaoModal(true)}
                      title="Concluir turma após validações"
                    >
                      <i className="bi bi-mortarboard me-2"></i>
                      Concluir Turma
                    </button>
                  )}
                </>
              )}
              
              <Link 
                to={`/turmas/${id}/edit`} 
                className="btn btn-warning"
              >
                <i className="bi bi-pencil me-2"></i>
                Editar Turma
              </Link>
              <Link 
                to="/turmas" 
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-clipboard me-2"></i>
                Lista de Turmas
              </Link>
              <Link 
                to="/alunos/novo" 
                className="btn btn-outline-primary"
              >
                <i className="bi bi-person-plus me-2"></i>
                Cadastrar Novo Aluno
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Frequência */}
      {showFrequenciaForm && (
        <FrequenciaForm
          turmaId={id!}
          alunos={alunosDaTurma.map(aluno => ({
            id: aluno.id,
            nome: aluno.nome,
            ra: aluno.matricula
          }))}
          onClose={() => setShowFrequenciaForm(false)}
        />
      )}

      {/* Modal de Conclusão da Turma */}
      {showConclusaoModal && verificacaoConclusao && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowConclusaoModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className={`modal-header ${verificacaoConclusao.pode_concluir ? 'bg-success' : 'bg-warning'} text-white`}>
                <h5 className="modal-title">
                  <i className={`bi ${verificacaoConclusao.pode_concluir ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  Concluir Turma
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowConclusaoModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6 className="mb-3">Turma: <strong>{turma.nome}</strong></h6>
                
                {/* Estatísticas */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>
                      <i className="bi bi-bar-chart me-2"></i>
                      Estatísticas de Preenchimento
                    </strong>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="text-center">
                          <div className="h3 text-primary">{verificacaoConclusao.estatisticas.total_alunos}</div>
                          <div className="text-muted">Alunos</div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="text-center">
                          <div className="h3 text-info">{verificacaoConclusao.estatisticas.total_avaliacoes}</div>
                          <div className="text-muted">Avaliações</div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="text-center">
                          <div className={`h3 ${verificacaoConclusao.estatisticas.notas.percentual >= 100 ? 'text-success' : 'text-danger'}`}>
                            {verificacaoConclusao.estatisticas.notas.percentual.toFixed(0)}%
                          </div>
                          <div className="text-muted">
                            Notas ({verificacaoConclusao.estatisticas.notas.cadastradas}/{verificacaoConclusao.estatisticas.notas.esperadas})
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {verificacaoConclusao.estatisticas.frequencias.esperadas > 0 && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <div className="text-center">
                            <div className={`h3 ${verificacaoConclusao.estatisticas.frequencias.percentual >= 90 ? 'text-success' : 'text-warning'}`}>
                              {verificacaoConclusao.estatisticas.frequencias.percentual.toFixed(0)}%
                            </div>
                            <div className="text-muted">
                              Frequências ({verificacaoConclusao.estatisticas.frequencias.cadastradas}/{verificacaoConclusao.estatisticas.frequencias.esperadas}) - 
                              Estimados {verificacaoConclusao.estatisticas.frequencias.dias_letivos_estimados} dias letivos
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensagens */}
                {verificacaoConclusao.pode_concluir ? (
                  <div className="alert alert-success">
                    <strong>
                      <i className="bi bi-check-circle me-2"></i>
                      Turma pronta para ser concluída!
                    </strong>
                    <p className="mb-0 mt-2">
                      Todos os requisitos foram atendidos. Ao concluir, a turma será marcada como finalizada 
                      e não será mais possível registrar frequências ou lançar notas.
                    </p>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <strong>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Requisitos não atendidos:
                    </strong>
                    <ul className="mb-0 mt-2">
                      {verificacaoConclusao.motivos.map((motivo, idx) => (
                        <li key={idx}>{motivo}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowConclusaoModal(false)}
                  disabled={loadingConclusao}
                >
                  Cancelar
                </button>
                {verificacaoConclusao.pode_concluir && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={concluirTurma}
                    disabled={loadingConclusao}
                  >
                    {loadingConclusao ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Concluindo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-mortarboard me-2"></i>
                        Concluir Turma
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TurmaDetalhes;
