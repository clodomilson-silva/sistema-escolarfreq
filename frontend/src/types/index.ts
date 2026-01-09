// Turma Base (criada pelo admin)
export interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: string;
  alunos: string[];
  tipo: 'base' | 'disciplina'; // 'base' = turma principal, 'disciplina' = turma-disciplina
  turma_base_id?: string; // ID da turma base (se for turma-disciplina)
  disciplina?: string; // Nome da disciplina/unidade curricular
  professor_id?: string; // ID do professor responsável
  professor_nome?: string; // Nome do professor
  carga_horaria?: number; // Carga horária da disciplina
  descricao?: string; // Descrição da disciplina
  status?: 'ativa' | 'inativa' | 'concluida';
  criado_em?: string;
  atualizado_em?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  ra: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  turma_id?: string;
}

export interface FrequenciaData {
  id: string;
  aluno_id: string;
  turma_id: string;
  data: string;
  presente: boolean;
  observacoes?: string;
  justificativa?: string;
  disciplina?: string; // Para identificar a disciplina da frequência
}

export interface EstatisticasFrequencia {
  total_dias: number;
  presencas: number;
  faltas: number;
  percentual_presenca: number;
  percentual_faltas?: number;
  ultima_presenca?: string;
  ultima_falta?: string;
}

// Estatísticas detalhadas por aluno
export interface EstatisticasDetalhadasAluno {
  aluno_id: string;
  aluno_nome: string;
  total_dias_letivos: number;
  total_presencas: number;
  total_faltas: number;
  percentual_presenca: number;
  percentual_faltas: number;
  status_frequencia: 'excelente' | 'bom' | 'regular' | 'critico'; // baseado no percentual
  sequencia_presencas: number; // dias consecutivos presente
  sequencia_faltas: number; // dias consecutivos faltando
  ultima_presenca?: string;
  ultima_falta?: string;
}