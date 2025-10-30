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
      const db = getFirestore();
      const dataObj = new Date(data);
      const dataFormatada = dataObj.toISOString().split('T')[0];

      // Primeiro, verificar se existe um documento de frequência para a turma
      const frequenciasTurmaRef = db.collection('frequencias').doc(turmaId);
      const frequenciasTurmaDoc = await frequenciasTurmaRef.get();

      if (!frequenciasTurmaDoc.exists) {
        // Se não existe, retornar array vazio
        return [];
      }

      const frequenciasTurma = frequenciasTurmaDoc.data();
      const registrosDoDia = frequenciasTurma.alunos || {};

      // Converter os registros em um array no formato esperado
      const frequencias = [];
      for (const [alunoId, dadosAluno] of Object.entries(registrosDoDia)) {
        if (dadosAluno.registros && dadosAluno.registros[dataFormatada]) {
          const registro = dadosAluno.registros[dataFormatada];
          frequencias.push({
            id: `${turmaId}_${alunoId}_${dataFormatada}`,
            aluno_id: alunoId,
            turma_id: turmaId,
            data: dataObj,
            presente: registro.presente,
            observacoes: registro.observacoes || '',
            justificativa: registro.justificativa || '',
            atualizado_em: registro.atualizado_em
          });
        }
      }

      return frequencias;
    } catch (error) {
      console.error('Erro detalhado:', error);
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

  // Verificar se já existe frequência registrada para a turma na data
  async verificarFrequenciaTurmaData(turmaId, data) {
    try {
      const db = getFirestore();
      const dataObj = new Date(data);
      const dataFormatada = dataObj.toISOString().split('T')[0];

      const frequenciaRef = db.collection('frequencias').doc(turmaId);
      const doc = await frequenciaRef.get();

      if (doc.exists) {
        const dados = doc.data();
        return dados.resumo && dados.resumo[dataFormatada];
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar frequência:', error);
      return false;
    }
  }

  // Registrar frequência em lote para uma turma inteira
  async registrarFrequenciaLote(turmaId, data, frequencias) {
    try {
      const db = getFirestore();
      const agora = new Date().toISOString();
      const dataObj = new Date(data);
      const dataFormatada = dataObj.toISOString().split('T')[0];

      // Verificar se já existe frequência registrada para esta data
      const frequenciaExistente = await this.verificarFrequenciaTurmaData(turmaId, data);
      if (frequenciaExistente) {
        throw new Error(`Frequência já registrada para a turma na data ${dataFormatada}`);
      }

      // Verificar/criar documento de frequências da turma
      const frequenciasTurmaRef = db.collection('frequencias').doc(turmaId);
      const frequenciasTurmaDoc = await frequenciasTurmaRef.get();

      if (!frequenciasTurmaDoc.exists) {
        // Criar documento inicial se não existir
        await frequenciasTurmaRef.set({
          turma_id: turmaId,
          criado_em: agora,
          atualizado_em: agora,
          alunos: {},
          resumo: {}
        });
      }

      // Preparar atualizações
      const batch = db.batch();
      const atualizacoes = {
        atualizado_em: agora,
        [`resumo.${dataFormatada}`]: {
          data: dataObj,
          presentes: frequencias.filter(f => f.presente).length,
          ausentes: frequencias.filter(f => !f.presente).length,
          total: frequencias.length,
          atualizado_em: agora
        }
      };

      // Atualizar registros individuais dos alunos
      frequencias.forEach(freq => {
        const alunoId = freq.aluno_id;
        atualizacoes[`alunos.${alunoId}.registros.${dataFormatada}`] = {
          presente: freq.presente,
          observacoes: freq.observacoes || '',
          justificativa: freq.justificativa || '',
          atualizado_em: agora
        };
        
        // Atualizar estatísticas do aluno
        atualizacoes[`alunos.${alunoId}.ultima_atualizacao`] = agora;
        if (freq.presente) {
          atualizacoes[`alunos.${alunoId}.ultima_presenca`] = dataObj;
        }
      });

      // Aplicar todas as atualizações em uma única operação
      batch.update(frequenciasTurmaRef, atualizacoes);

      // Commit das alterações
      await batch.commit();
      
      return {
        success: true,
        message: 'Frequências registradas com sucesso',
        data: {
          turma_id: turmaId,
          data: dataFormatada,
          total_registros: frequencias.length
        }
      };
    } catch (error) {
      console.error('Erro detalhado:', error);
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
