import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api", // Backend Django
  headers: {
    "Content-Type": "application/json",
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000, // Timeout configurável
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Tipos para frequência (compatíveis com Django)
export interface FrequenciaData {
  id?: string;
  turma: string;
  turma_nome?: string;
  aluno: string;
  aluno_nome?: string;
  aluno_matricula?: string;
  data: string | Date;
  disciplina: string;
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
  criado_em?: Date;
  atualizado_em?: Date;
}

export interface FrequenciaLote {
  aluno_id: string;
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
}

export interface EstatisticasFrequencia {
  aluno_id: string;
  aluno_nome: string;
  total_aulas: number;
  presencas: number;
  ausencias: number;
  justificadas: number;
  percentual_presenca: number;
}

// Serviços de frequência (adaptados para Django)
export const frequenciaAPI = {
  // Buscar frequências por turma e data
  buscarPorTurmaEData: (turmaId: string, data: string) =>
    api.get<{ success: boolean; data: FrequenciaData[]; total: number }>(
      `/frequencia/turma/?turma_id=${turmaId}&data=${data}`
    ),

  // Buscar frequências por aluno
  buscarPorAluno: (alunoId: string, filtros?: {
    turma_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    const params = new URLSearchParams({ aluno_id: alunoId });
    if (filtros?.turma_id) params.append('turma_id', filtros.turma_id);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
    
    return api.get<{ success: boolean; data: FrequenciaData[]; total: number }>(
      `/frequencia/aluno/?${params.toString()}`
    );
  },

  // Obter estatísticas de um aluno
  obterEstatisticas: (alunoId: string, turmaId?: string) => {
    const params = new URLSearchParams({ aluno_id: alunoId });
    if (turmaId) params.append('turma_id', turmaId);
    return api.get<{ success: boolean; data: EstatisticasFrequencia }>(
      `/frequencia/estatisticas/?${params.toString()}`
    );
  },

  // Buscar frequência por ID
  buscarPorId: (id: string) =>
    api.get<{ success: boolean; data: FrequenciaData }>(`/frequencia/${id}/`),

  // Registrar frequência individual
  registrar: (frequencia: Omit<FrequenciaData, 'id' | 'criado_em' | 'atualizado_em'>) =>
    api.post<{ success: boolean; data: FrequenciaData; message: string }>('/frequencia/', frequencia),

  // Registrar frequência em lote para uma turma inteira
  registrarLote: (turmaId: string, data: string, frequencias: FrequenciaLote[], disciplina: string = 'Geral') =>
    api.post<{ 
      success: boolean;
      data: {
        created: number;
        updated: number;
        total: number;
      };
      message: string;
    }>('/frequencia/bulk_create/', {
      turma_id: turmaId,
      data,
      disciplina,
      frequencias: frequencias.map(f => ({
        aluno_id: f.aluno_id,
        status: f.status,
        observacoes: f.observacoes || ''
      }))
    }),

  // Atualizar frequência
  atualizar: (id: string, updates: Partial<Pick<FrequenciaData, 'status' | 'observacoes'>>) =>
    api.put<{ success: boolean; data: FrequenciaData; message: string }>(`/frequencia/${id}/`, updates),

  // Deletar frequência
  deletar: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/frequencia/${id}/`)
};

export default api;
