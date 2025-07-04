const { getFirestore } = require('../config/firebase');

class TurmaService {
  constructor() {
    this.collection = 'turmas';
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

      const agora = new Date();
      const turma = {
        ...dadosTurma,
        alunos: dadosTurma.alunos || [],
        criado_em: agora,
        atualizado_em: agora
      };

      const docRef = await db.collection(this.collection).add(turma);
      
      return {
        id: docRef.id,
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

      return {
        id: doc.id,
        ...doc.data()
      };
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
        atualizado_em: new Date()
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

      alunos.push(alunoId);
      await db.collection(this.collection).doc(turmaId).update({
        alunos,
        atualizado_em: new Date()
      });

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
        atualizado_em: new Date()
      });

      return await this.obterTurmaPorId(turmaId);
    } catch (error) {
      throw new Error(`Erro ao remover aluno da turma: ${error.message}`);
    }
  }
}

module.exports = new TurmaService();
