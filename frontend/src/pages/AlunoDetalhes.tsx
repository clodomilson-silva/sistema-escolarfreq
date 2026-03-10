import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  dataNascimento: string;
  endereco?: string;
  telefone?: string;
  criado_em?: { _seconds: number; _nanoseconds: number } | string;
  atualizado_em?: { _seconds: number; _nanoseconds: number } | string;
}

interface Frequencia {
  id: string;
  turma: string;
  turma_nome: string;
  data: string;
  disciplina: string;
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
}

interface FrequenciasPorTurma {
  turma_id: string;
  turma_nome: string;
  disciplina: string;
  total_aulas: number;
  presencas: number;
  ausencias: number;
  justificadas: number;
  percentual_presenca: number;
  datas_faltadas: { data: string; justificada: boolean; observacoes?: string }[];
}

function AlunoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [frequencias, setFrequencias] = useState<FrequenciasPorTurma[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFreq, setLoadingFreq] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { isReady } = useAuth();

  useEffect(() => {
    const buscarAluno = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/alunos/${id}/`);
        
        if (response.data.success) {
          setAluno(response.data.data);
        } else {
          setErro("Aluno não encontrado");
        }
      } catch (error: unknown) {
        console.error("Erro ao buscar aluno:", error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Erro ao carregar dados do aluno";
        setErro(errorMessage || "Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    };

    const buscarFrequencias = async () => {
      try {
        setLoadingFreq(true);
        // Buscar todas as frequências do aluno
        const response = await api.get(`/frequencia/?aluno_id=${id}`);
        
        if (response.data.success) {
          const todasFreq: Frequencia[] = response.data.data;
          
          // Agrupar por turma
          const porTurma = new Map<string, FrequenciasPorTurma>();
          
          todasFreq.forEach((freq) => {
            if (!porTurma.has(freq.turma)) {
              porTurma.set(freq.turma, {
                turma_id: freq.turma,
                turma_nome: freq.turma_nome || 'Sem nome',
                disciplina: freq.disciplina,
                total_aulas: 0,
                presencas: 0,
                ausencias: 0,
                justificadas: 0,
                percentual_presenca: 0,
                datas_faltadas: []
              });
            }
            
            const dados = porTurma.get(freq.turma)!;
            dados.total_aulas++;
            
            if (freq.status === 'presente') {
              dados.presencas++;
            } else if (freq.status === 'ausente') {
              dados.ausencias++;
              dados.datas_faltadas.push({
                data: freq.data,
                justificada: false,
                observacoes: freq.observacoes
              });
            } else if (freq.status === 'justificado') {
              dados.justificadas++;
              dados.datas_faltadas.push({
                data: freq.data,
                justificada: true,
                observacoes: freq.observacoes
              });
            }
          });
          
          // Calcular percentuais
          const resultado: FrequenciasPorTurma[] = [];
          porTurma.forEach((dados) => {
            dados.percentual_presenca = dados.total_aulas > 0 
              ? (dados.presencas / dados.total_aulas) * 100 
              : 0;
            // Ordenar datas de forma decrescente
            dados.datas_faltadas.sort((a, b) => 
              new Date(b.data).getTime() - new Date(a.data).getTime()
            );
            resultado.push(dados);
          });
          
          setFrequencias(resultado);
        }
      } catch (error) {
        console.error("Erro ao buscar frequências:", error);
      } finally {
        setLoadingFreq(false);
      }
    };

    if (isReady && id) {
      buscarAluno();
      buscarFrequencias();
    }
  }, [isReady, id]);

  const formatarData = (data: { _seconds: number; _nanoseconds: number } | string | undefined) => {
    if (!data) return "Não informado";
    
    try {
      // Se for um timestamp do Firebase
      if (typeof data === 'object' && '_seconds' in data) {
        return new Date(data._seconds * 1000).toLocaleDateString('pt-BR');
      }
      // Se for uma string de data
      if (typeof data === 'string') {
        return new Date(data).toLocaleDateString('pt-BR');
      }
      return "Data inválida";
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3 text-muted fs-5">Carregando dados do aluno...</p>
          </div>
        </div>
      </>
    );
  }

  if (erro || !aluno) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <h4>❌ Erro</h4>
                <p>{erro || "Aluno não encontrado"}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate("/alunos")}
                >
                  🔙 Voltar para Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid p-4">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="d-flex align-items-center mb-4 justify-content-between">
              <h1 className="h2 mb-0">
                <span className="text-primary">👤</span> Detalhes do Aluno
              </h1>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate("/alunos")}
              >
                🔙 Voltar
              </button>
            </div>

            {/* CardFrequências por Turma */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">📅 Frequência por Turma</h5>
                    {loadingFreq ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                        <p className="mt-2 text-muted">Carregando frequências...</p>
                      </div>
                    ) : frequencias.length === 0 ? (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle"></i> Nenhuma frequência registrada para este aluno.
                      </div>
                    ) : (
                      <div className="accordion" id="accordionFrequencias">
                        {frequencias.map((freq, index) => (
                          <div className="accordion-item" key={freq.turma_id}>
                            <h2 className="accordion-header">
                              <button
                                className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse${index}`}
                                aria-expanded={index === 0}
                                aria-controls={`collapse${index}`}
                              >
                                <div className="w-100">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <strong>{freq.turma_nome}</strong>
                                      <small className="text-muted ms-2">({freq.disciplina})</small>
                                    </div>
                                    <div className="me-3">
                                      <span className={`badge ${
                                        freq.percentual_presenca >= 75 ? 'bg-success' : 
                                        freq.percentual_presenca >= 60 ? 'bg-warning' : 'bg-danger'
                                      }`}>
                                        {freq.percentual_presenca.toFixed(1)}% de presença
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </h2>
                            <div
                              id={`collapse${index}`}
                              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                              data-bs-parent="#accordionFrequencias"
                            >
                              <div className="accordion-body">
                                {/* Estatísticas */}
                                <div className="row mb-3">
                                  <div className="col-md-3">
                                    <div className="card text-center">
                                      <div className="card-body">
                                        <h6 className="text-muted mb-1">Total de Aulas</h6>
                                        <h4 className="mb-0">{freq.total_aulas}</h4>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card text-center border-success">
                                      <div className="card-body">
                                        <h6 className="text-success mb-1">Presenças</h6>
                                        <h4 className="mb-0 text-success">{freq.presencas}</h4>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card text-center border-danger">
                                      <div className="card-body">
                                        <h6 className="text-danger mb-1">Faltas</h6>
                                        <h4 className="mb-0 text-danger">{freq.ausencias}</h4>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card text-center border-info">
                                      <div className="card-body">
                                        <h6 className="text-info mb-1">Justificadas</h6>
                                        <h4 className="mb-0 text-info">{freq.justificadas}</h4>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Lista de Datas Faltadas */}
                                {freq.datas_faltadas.length > 0 && (
                                  <div>
                                    <h6 className="text-muted mb-2">📋 Datas em que faltou:</h6>
                                    <div className="list-group">
                                      {freq.datas_faltadas.map((falta, idx) => (
                                        <div key={idx} className="list-group-item">
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                              <strong>{new Date(falta.data).toLocaleDateString('pt-BR')}</strong>
                                              {falta.observacoes && (
                                                <small className="d-block text-muted">
                                                  {falta.observacoes}
                                                </small>
                                              )}
                                            </div>
                                            <span className={`badge ${
                                              falta.justificada ? 'bg-info' : 'bg-danger'
                                            }`}>
                                              {falta.justificada ? 'Justificada' : 'Não Justificada'}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/*  Principal */}
            <div className="card shadow-lg border-0 w-100 mx-auto" style={{ borderRadius: '20px', maxWidth: '100%' }}>
              <div className="card-header bg-primary text-white text-center py-4" style={{ borderRadius: '20px 20px 0 0' }}>
                <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle mb-3" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  👨‍🎓
                </div>
                <h3 className="mb-1">{aluno.nome}</h3>
                <p className="mb-0 fs-5">Matrícula: {aluno.matricula}</p>
              </div>

              <div className="card-body p-5">
                <div className="col g-4">
                  {/* Informações Pessoais */}
                  <div className="row-md-6">
                    <h5 className="text-primary mb-3">📋 Informações Pessoais</h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">📧 Email:</label>
                      <div className="p-2 bg-light rounded">
                        {aluno.email || "Não informado"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">🎂 Data de Nascimento:</label>
                      <div className="p-2 bg-light rounded">
                        {aluno.dataNascimento ? formatarData(aluno.dataNascimento) : "Não informado"}
                      </div>
                    </div>

                    {aluno.telefone && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">📞 Telefone:</label>
                        <div className="p-2 bg-light rounded">
                          {aluno.telefone}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações Adicionais */}
                  <div className="row-md-6">
                    <h5 className="text-primary mb-3">🏠 Informações Adicionais</h5>
                    
                    {aluno.endereco && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">📍 Endereço:</label>
                        <div className="p-2 bg-light rounded">
                          {aluno.endereco}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">📅 Cadastrado em:</label>
                      <div className="p-2 bg-light rounded">
                        {formatarData(aluno.criado_em)}
                      </div>
                    </div>

                    {aluno.atualizado_em && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">✏️ Última atualização:</label>
                        <div className="p-2 bg-light rounded">
                          {formatarData(aluno.atualizado_em)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-center">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
                        style={{ borderRadius: '12px' }}
                      >
                        ✏️ Editar Aluno
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate("/alunos")}
                        style={{ borderRadius: '12px' }}
                      >
                        📋 Ver Todos os Alunos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AlunoDetalhes;
