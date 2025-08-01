const { getFirestore } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

class FrequenciaService {
  constructor() {
    this.getCollection = () => getFirestore().collection('frequencia');
  }

  // Registrar presença de um aluno em uma data
  async registrarPresenca(frequenciaData) {
    try {
      const docRef = await this.getCollection().add({
        ...frequenciaData,
        data_criacao: FieldValue.serverTimestamp(),
        data_atualizacao: FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Erro ao registrar frequência: ${error.message}`);
    }
  }

  // Buscar frequência por ID
  async buscarPorId(id) {
    try {
      const doc = await this.getCollection().doc(id).get();
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        data: data.data?.toDate?.() || data.data,
        data_criacao: data.data_criacao?.toDate?.() || data.data_criacao,
        data_atualizacao: data.data_atualizacao?.toDate?.() || data.data_atualizacao
      };
    } catch (error) {
      throw new Error(`Erro ao buscar frequência: ${error.message}`);
    }
  }

  // Buscar frequências por turma e data
  async buscarPorTurmaEData(turmaId, data) {
    try {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      const snapshot = await this.getCollection()
        .where('turma_id', '==', turmaId)
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          data: data.data?.toDate?.() || data.data,
          data_criacao: data.data_criacao?.toDate?.() || data.data_criacao,
          data_atualizacao: data.data_atualizacao?.toDate?.() || data.data_atualizacao
        };
      });
    } catch (error) {
      throw new Error(`Erro ao buscar frequências da turma: ${error.message}`);
    }
  }

  // Buscar frequências por aluno
  async buscarPorAluno(alunoId, filtros = {}) {
    try {
      let query = this.getCollection().where('aluno_id', '==', alunoId);

      if (filtros.turma_id) {
        query = query.where('turma_id', '==', filtros.turma_id);
      }

      if (filtros.data_inicio) {
        query = query.where('data', '>=', new Date(filtros.data_inicio));
      }

      if (filtros.data_fim) {
        query = query.where('data', '<=', new Date(filtros.data_fim));
      }

      const snapshot = await query.orderBy('data', 'desc').get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          data: data.data?.toDate?.() || data.data,
          data_criacao: data.data_criacao?.toDate?.() || data.data_criacao,
          data_atualizacao: data.data_atualizacao?.toDate?.() || data.data_atualizacao
        };
      });
    } catch (error) {
      throw new Error(`Erro ao buscar frequências do aluno: ${error.message}`);
    }
  }

  // Atualizar frequência
  async atualizar(id, updates) {
    try {
      await this.getCollection().doc(id).update({
        ...updates,
        data_atualizacao: FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Erro ao atualizar frequência: ${error.message}`);
    }
  }

  // Deletar frequência
  async deletar(id) {
    try {
      await this.getCollection().doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar frequência: ${error.message}`);
    }
  }

  // Registrar frequência em lote para uma turma inteira
  async registrarFrequenciaLote(turmaId, data, frequencias) {
    try {
      const db = getFirestore();
      const batch = db.batch();
      const timestamp = FieldValue.serverTimestamp();

      // Primeiro, verificar se já existe frequência para esta turma nesta data
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      const existingSnapshot = await this.getCollection()
        .where('turma_id', '==', turmaId)
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
        .get();

      // Deletar registros existentes
      existingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Adicionar novos registros
      frequencias.forEach(freq => {
        const docRef = this.getCollection().doc();
        batch.set(docRef, {
          aluno_id: freq.aluno_id,
          turma_id: turmaId,
          data: new Date(data),
          presente: freq.presente,
          observacoes: freq.observacoes || '',
          justificativa: freq.justificativa || '',
          data_criacao: timestamp,
          data_atualizacao: timestamp
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Erro ao registrar frequência em lote: ${error.message}`);
    }
  }

  // Obter estatísticas de frequência de um aluno
  async obterEstatisticasAluno(alunoId, turmaId = null) {
    try {
      let query = this.getCollection().where('aluno_id', '==', alunoId);
      
      if (turmaId) {
        query = query.where('turma_id', '==', turmaId);
      }

      const snapshot = await query.get();
      
      const total = snapshot.size;
      const presencas = snapshot.docs.filter(doc => doc.data().presente).length;
      const faltas = total - presencas;
      
      return {
        total_dias: total,
        presencas,
        faltas,
        percentual_presenca: total > 0 ? ((presencas / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  // Verificar se frequência já foi registrada para aluno em data específica
  async verificarFrequenciaExiste(alunoId, turmaId, data) {
    try {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      const snapshot = await this.getCollection()
        .where('aluno_id', '==', alunoId)
        .where('turma_id', '==', turmaId)
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      throw new Error(`Erro ao verificar frequência existente: ${error.message}`);
    }
  }
}

module.exports = new FrequenciaService();
