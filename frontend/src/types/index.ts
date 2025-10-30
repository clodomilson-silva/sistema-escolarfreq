export interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  alunos: string[];
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  ra: string;
}

export interface FrequenciaData {
  id: string;
  aluno_id: string;
  turma_id: string;
  data: string;
  presente: boolean;
  observacoes?: string;
  justificativa?: string;
}

export interface EstatisticasFrequencia {
  total_dias: number;
  presencas: number;
  faltas: number;
  percentual_presenca: number;
}