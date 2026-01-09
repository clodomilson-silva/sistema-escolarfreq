import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000") + "/api", // Backend Node.js
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

// Tipos para frequência
export interface FrequenciaData {
  id?: string;
  aluno_id: string;
  turma_id: string;
  data: string | Date;
  presente: boolean;
  observacoes?: string;
  justificativa?: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

export interface FrequenciaLote {
  aluno_id: string;
  presente: boolean;
  observacoes?: string;
  justificativa?: string;
}

export interface EstatisticasFrequencia {
  total_dias: number;
  presencas: number;
  faltas: number;
  percentual_presenca: string;
}

// Serviços de frequência
export const frequenciaAPI = {
  // Buscar frequências por turma e data
  buscarPorTurmaEData: (turmaId: string, data: string) =>
    api.get<FrequenciaData[]>(`/frequencia/turma/${turmaId}?data=${data}`),

  // Buscar frequências por aluno
  buscarPorAluno: (alunoId: string, filtros?: {
    turma_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    const params = new URLSearchParams();
    if (filtros?.turma_id) params.append('turma_id', filtros.turma_id);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
    
    return api.get<FrequenciaData[]>(`/frequencia/aluno/${alunoId}?${params.toString()}`);
  },

  // Obter estatísticas de um aluno
  obterEstatisticas: (alunoId: string, turmaId?: string) => {
    const params = turmaId ? `?turma_id=${turmaId}` : '';
    return api.get<EstatisticasFrequencia>(`/frequencia/estatisticas/${alunoId}${params}`);
  },

  // Buscar frequência por ID
  buscarPorId: (id: string) =>
    api.get<FrequenciaData>(`/frequencia/${id}`),

  // Registrar frequência individual
  registrar: (frequencia: Omit<FrequenciaData, 'id' | 'data_criacao' | 'data_atualizacao'>) =>
    api.post<{ message: string; data: FrequenciaData }>('/frequencia', frequencia),

  // Registrar frequência em lote para uma turma inteira
  registrarLote: (turmaId: string, data: string, frequencias: FrequenciaLote[]) =>
    api.post<{ 
      success: boolean;
      message: string;
      data?: {
        turma_id: string;
        data: string;
        total_registros: number;
      };
    }>('/frequencia/lote', {
      turma_id: turmaId,
      data,
      frequencias
    }),

  // Atualizar frequência
  atualizar: (id: string, updates: Partial<Omit<FrequenciaData, 'id' | 'aluno_id' | 'turma_id' | 'data_criacao' | 'data_atualizacao'>>) =>
    api.put<{ message: string; data: FrequenciaData }>(`/frequencia/${id}`, updates),

  // Deletar frequência
  deletar: (id: string) =>
    api.delete<{ message: string }>(`/frequencia/${id}`)
};

export default api;
