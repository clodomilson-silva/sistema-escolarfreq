const { getFirestore } = require('../config/firebase');

class TurmaService {
  constructor() {
    this.collection = 'turmas';
  }

  // Função auxiliar para converter timestamps do Firestore
  formatarTurmaParaResposta(turmaData) {
    const turma = { ...turmaData };
    
    // Converter timestamps do Firestore para strings ISO
    if (turma.criado_em && turma.criado_em._seconds) {
      turma.criado_em = new Date(turma.criado_em._seconds * 1000).toISOString();
    }
    
    if (turma.atualizado_em && turma.atualizado_em._seconds) {
      turma.atualizado_em = new Date(turma.atualizado_em._seconds * 1000).toISOString();
    }
    
    return turma;
  }

  async criarTurma(dadosTurma) {
    try {
      const db = getFirestore();
      
      // Verificar se já existe uma turma com o mesmo nome
      const nomeSnapshot = await db.collection(this.collection)
        .where('nome', '==', dadosTurma.nome)
        .get();
      
      if (!nomeSnapshot.empty) {
        throw new Error('Já existe uma turma com este nome');
      }

      const agora = new Date().toISOString();
      const turma = {
        ...dadosTurma,
        alunos: dadosTurma.alunos || [],
        horarios: dadosTurma.horarios || {},
        diasLetivos: dadosTurma.diasLetivos || [],
        frequencias: [],
        autorizacoes: [],
        status: 'ativa',
        criado_em: agora,
        atualizado_em: agora
      };

      // Criar documento da turma
      const docRef = await db.collection(this.collection).add(turma);
      const turmaId = docRef.id;

      // Criar coleção de frequências para a turma
      await db.collection('frequencias').doc(turmaId).set({
        turma_id: turmaId,
        registros: [],
        ultima_atualizacao: agora
      });

      // Criar coleção de autorizações para a turma
      await db.collection('autorizacoes').doc(turmaId).set({
        turma_id: turmaId,
        registros: [],
        ultima_atualizacao: agora
      });
      
      return {
        id: turmaId,
        ...turma
      };
    } catch (error) {
      throw new Error(`Erro ao criar turma: ${error.message}`);
    }
  }

  async listarTurmas(filtros = {}) {
    try {
      const db = getFirestore();
      let query = db.collection(this.collection);

      if (filtros.ano) {
        query = query.where('ano', '==', parseInt(filtros.ano));
      }
      
      if (filtros.turno) {
        query = query.where('turno', '==', filtros.turno);
      }

      const snapshot = await query.orderBy('nome').get();
      
      return snapshot.docs.map(doc => 
        this.formatarTurmaParaResposta({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(`Erro ao listar turmas: ${error.message}`);
    }
  }

  async obterTurmaPorId(id) {
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return this.formatarTurmaParaResposta({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      throw new Error(`Erro ao obter turma: ${error.message}`);
    }
  }

  async atualizarTurma(id, dadosTurma) {
    try {
      const db = getFirestore();
      
      const turmaDoc = await db.collection(this.collection).doc(id).get();
      if (!turmaDoc.exists) {
        throw new Error('Turma não encontrada');
      }

      // Se estiver atualizando nome, verificar se não existe
      if (dadosTurma.nome && dadosTurma.nome !== turmaDoc.data().nome) {
        const nomeSnapshot = await db.collection(this.collection)
          .where('nome', '==', dadosTurma.nome)
          .get();
        
        if (!nomeSnapshot.empty) {
          throw new Error('Já existe uma turma com este nome');
        }
      }

      const dadosAtualizacao = {
        ...dadosTurma,
        atualizado_em: new Date().toISOString()
      };

      await db.collection(this.collection).doc(id).update(dadosAtualizacao);
      
      return await this.obterTurmaPorId(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar turma: ${error.message}`);
    }
  }

  async excluirTurma(id) {
    try {
      const db = getFirestore();
      
      const turmaDoc = await db.collection(this.collection).doc(id).get();
      if (!turmaDoc.exists) {
        throw new Error('Turma não encontrada');
      }

      await db.collection(this.collection).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Erro ao excluir turma: ${error.message}`);
    }
  }

  async adicionarAluno(turmaId, alunoId) {
    try {
      const db = getFirestore();
      
      const turmaDoc = await db.collection(this.collection).doc(turmaId).get();
      if (!turmaDoc.exists) {
        throw new Error('Turma não encontrada');
      }

      const turmaData = turmaDoc.data();
      const alunos = turmaData.alunos || [];
      
      if (alunos.includes(alunoId)) {
        throw new Error('Aluno já está nesta turma');
      }

      const agora = new Date().toISOString();

      // Adicionar aluno à lista de alunos da turma
      alunos.push(alunoId);
      await db.collection(this.collection).doc(turmaId).update({
        alunos,
        atualizado_em: agora
      });

      // Inicializar registro de frequência do aluno na turma
      const frequenciaRef = db.collection('frequencias').doc(turmaId);
      const frequenciaDoc = await frequenciaRef.get();
      
      if (frequenciaDoc.exists) {
        await frequenciaRef.update({
          [`alunos.${alunoId}`]: {
            registros: [],
            total_presencas: 0,
            total_faltas: 0,
            ultima_presenca: null,
            ultima_atualizacao: agora
          }
        });
      }

      // Inicializar registro de autorizações do aluno na turma
      const autorizacaoRef = db.collection('autorizacoes').doc(turmaId);
      const autorizacaoDoc = await autorizacaoRef.get();
      
      if (autorizacaoDoc.exists) {
        await autorizacaoRef.update({
          [`alunos.${alunoId}`]: {
            autorizacoes: [],
            responsaveis_autorizados: [],
            ultima_atualizacao: agora
          }
        });
      }

      return await this.obterTurmaPorId(turmaId);
    } catch (error) {
      throw new Error(`Erro ao adicionar aluno à turma: ${error.message}`);
    }
  }

  async removerAluno(turmaId, alunoId) {
    try {
      const db = getFirestore();
      
      const turmaDoc = await db.collection(this.collection).doc(turmaId).get();
      if (!turmaDoc.exists) {
        throw new Error('Turma não encontrada');
      }

      const turmaData = turmaDoc.data();
      const alunos = turmaData.alunos || [];
      
      const novoAlunos = alunos.filter(id => id !== alunoId);
      
      await db.collection(this.collection).doc(turmaId).update({
        alunos: novoAlunos,
        atualizado_em: new Date().toISOString()
      });

      return await this.obterTurmaPorId(turmaId);
    } catch (error) {
      throw new Error(`Erro ao remover aluno da turma: ${error.message}`);
    }
  }
}

module.exports = new TurmaService();
