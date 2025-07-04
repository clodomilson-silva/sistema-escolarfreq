const { getFirestore } = require('../config/firebase');

class AlunoService {
  constructor() {
    this.collection = 'alunos';
  }

  async criarAluno(dadosAluno) {
    try {
      const db = getFirestore();
      
      // Verificar se a matrícula já existe
      const matriculaSnapshot = await db.collection(this.collection)
        .where('matricula', '==', dadosAluno.matricula)
        .get();
      
      if (!matriculaSnapshot.empty) {
        throw new Error('Matrícula já existe');
      }

      // Verificar se o email já existe
      const emailSnapshot = await db.collection(this.collection)
        .where('email', '==', dadosAluno.email)
        .get();
      
      if (!emailSnapshot.empty) {
        throw new Error('Email já está em uso');
      }

      const agora = new Date();
      const aluno = {
        ...dadosAluno,
        data_nascimento: new Date(dadosAluno.data_nascimento),
        criado_em: agora,
        atualizado_em: agora
      };

      const docRef = await db.collection(this.collection).add(aluno);
      
      return {
        id: docRef.id,
        ...aluno,
        data_nascimento: dadosAluno.data_nascimento
      };
    } catch (error) {
      throw new Error(`Erro ao criar aluno: ${error.message}`);
    }
  }

  async listarAlunos(filtros = {}) {
    try {
      const db = getFirestore();
      let query = db.collection(this.collection);

      // Aplicar filtros se fornecidos
      if (filtros.nome) {
        query = query.where('nome', '>=', filtros.nome)
                    .where('nome', '<=', filtros.nome + '\uf8ff');
      }
      
      if (filtros.matricula) {
        query = query.where('matricula', '==', filtros.matricula);
      }

      const snapshot = await query.orderBy('nome').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data_nascimento: doc.data().data_nascimento.toDate().toISOString().split('T')[0]
      }));
    } catch (error) {
      throw new Error(`Erro ao listar alunos: ${error.message}`);
    }
  }

  async obterAlunoPorId(id) {
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        data_nascimento: doc.data().data_nascimento.toDate().toISOString().split('T')[0]
      };
    } catch (error) {
      throw new Error(`Erro ao obter aluno: ${error.message}`);
    }
  }

  async obterAlunoPorMatricula(matricula) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection)
        .where('matricula', '==', matricula)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        data_nascimento: doc.data().data_nascimento.toDate().toISOString().split('T')[0]
      };
    } catch (error) {
      throw new Error(`Erro ao obter aluno por matrícula: ${error.message}`);
    }
  }

  async atualizarAluno(id, dadosAluno) {
    try {
      const db = getFirestore();
      
      // Verificar se o aluno existe
      const alunoDoc = await db.collection(this.collection).doc(id).get();
      if (!alunoDoc.exists) {
        throw new Error('Aluno não encontrado');
      }

      // Se estiver atualizando matrícula, verificar se não existe
      if (dadosAluno.matricula && dadosAluno.matricula !== alunoDoc.data().matricula) {
        const matriculaSnapshot = await db.collection(this.collection)
          .where('matricula', '==', dadosAluno.matricula)
          .get();
        
        if (!matriculaSnapshot.empty) {
          throw new Error('Matrícula já existe');
        }
      }

      // Se estiver atualizando email, verificar se não existe
      if (dadosAluno.email && dadosAluno.email !== alunoDoc.data().email) {
        const emailSnapshot = await db.collection(this.collection)
          .where('email', '==', dadosAluno.email)
          .get();
        
        if (!emailSnapshot.empty) {
          throw new Error('Email já está em uso');
        }
      }

      const dadosAtualizacao = {
        ...dadosAluno,
        atualizado_em: new Date()
      };

      if (dadosAluno.data_nascimento) {
        dadosAtualizacao.data_nascimento = new Date(dadosAluno.data_nascimento);
      }

      await db.collection(this.collection).doc(id).update(dadosAtualizacao);
      
      return await this.obterAlunoPorId(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar aluno: ${error.message}`);
    }
  }

  async excluirAluno(id) {
    try {
      const db = getFirestore();
      
      // Verificar se o aluno existe
      const alunoDoc = await db.collection(this.collection).doc(id).get();
      if (!alunoDoc.exists) {
        throw new Error('Aluno não encontrado');
      }

      await db.collection(this.collection).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Erro ao excluir aluno: ${error.message}`);
    }
  }

  async contarAlunos() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection).count().get();
      return snapshot.data().count;
    } catch (error) {
      throw new Error(`Erro ao contar alunos: ${error.message}`);
    }
  }
}

module.exports = new AlunoService();
