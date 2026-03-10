// Turma (Django)
export interface Turma {
  id: string;
  nome: string;
  ano: number;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  disciplina: string;
  professor?: string;
  sala?: string;
  tipo?: 'base' | 'disciplina';
  turma_base_id?: string | null;
  alunos: Aluno[] | string[]; // Array de objetos Aluno ou IDs
  total_alunos?: number;
  horarios?: Record<string, unknown>;
  dias_letivos?: string[];
  data_inicio?: string | null; // Data de início do período letivo
  data_fim?: string | null; // Data de término do período letivo
  status: 'ativa' | 'inativa' | 'concluida';
  criado_em?: string;
  atualizado_em?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  data_nascimento?: string;
  telefone?: string;
  endereco?: string;
  responsavel?: string;
  telefone_responsavel?: string;
  idade?: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface FrequenciaData {
  id: string;
  turma: string;
  turma_nome?: string;
  aluno: string;
  aluno_nome?: string;
  aluno_matricula?: string;
  data: string;
  disciplina: string;
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
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
}}

// Avaliação (Atividade/Prova)
export interface Avaliacao {
  id: string;
  turma: string;
  turma_nome?: string;
  descricao: string;
  tipo: 'prova' | 'trabalho' | 'atividade' | 'projeto' | 'seminario' | 'participacao' | 'outro';
  data: string;
  peso: number;
  nota_maxima: number;
  observacoes?: string;
  total_notas?: number;
  criado_em?: string;
  atualizado_em?: string;
}

// Nota
export interface Nota {
  id: string;
  avaliacao: string;
  avaliacao_descricao?: string;
  avaliacao_data?: string;
  avaliacao_tipo?: string;
  aluno: string;
  aluno_nome?: string;
  valor: number;
  nota_maxima?: number;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

// Boletim do Aluno
export interface BoletimDisciplina {
  turma_id: string;
  turma_nome: string;
  disciplina: string;
  professor?: string;
  periodo_letivo: {
    data_inicio?: string | null;
    data_fim?: string | null;
  };
  notas: {
    avaliacoes: Array<{
      avaliacao: string;
      tipo: string;
      data: string;
      valor: number;
      nota_maxima: number;
      peso: number;
      observacoes?: string;
    }>;
    total_avaliacoes: number;
    media: number;
  };
  frequencia: {
    total_aulas: number;
    presencas: number;
    ausencias: number;
    justificadas: number;
    percentual_presenca: number;
  };
}

export interface BoletimAluno {
  aluno: {
    id: string;
    nome: string;
    matricula: string;
    email: string;
  };
  periodo: {
    data_inicio?: string | null;
    data_fim?: string | null;
  };
  disciplinas: BoletimDisciplina[];
}
