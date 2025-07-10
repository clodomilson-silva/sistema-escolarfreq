const { getFirestore } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.collection = 'administradores';
    this.jwtSecret = process.env.JWT_SECRET || 'sistema-escolar-secret-key-2025';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
  }

  // Criar usuário administrador
  async criarAdministrador(dadosAdmin) {
    try {
      const db = getFirestore();
      
      // Verificar se o email já existe
      const emailSnapshot = await db.collection(this.collection)
        .where('email', '==', dadosAdmin.email)
        .get();
      
      if (!emailSnapshot.empty) {
        throw new Error('Email já está em uso por outro administrador');
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(dadosAdmin.senha, 12);

      const agora = new Date();
      const administrador = {
        nome: dadosAdmin.nome,
        email: dadosAdmin.email,
        senha: senhaHash,
        role: 'admin',
        ativo: true,
        criado_em: agora,
        atualizado_em: agora,
        ultimo_login: null
      };

      const docRef = await db.collection(this.collection).add(administrador);
      
      // Remover senha do retorno
      const { senha, ...adminSemSenha } = administrador;
      
      return {
        id: docRef.id,
        ...adminSemSenha
      };
    } catch (error) {
      throw new Error(`Erro ao criar administrador: ${error.message}`);
    }
  }

  // Login de administrador
  async login(email, senha) {
    try {
      const db = getFirestore();
      
      // Buscar administrador por email
      const adminSnapshot = await db.collection(this.collection)
        .where('email', '==', email)
        .where('ativo', '==', true)
        .get();
      
      if (adminSnapshot.empty) {
        throw new Error('Credenciais inválidas');
      }

      const adminDoc = adminSnapshot.docs[0];
      const adminData = adminDoc.data();
      
      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, adminData.senha);
      
      if (!senhaValida) {
        throw new Error('Credenciais inválidas');
      }

      // Atualizar último login
      await adminDoc.ref.update({
        ultimo_login: new Date(),
        atualizado_em: new Date()
      });

      // Gerar JWT token
      const payload = {
        id: adminDoc.id,
        email: adminData.email,
        nome: adminData.nome,
        role: adminData.role
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiration
      });

      // Remover senha do retorno
      const { senha: _, ...adminSemSenha } = adminData;

      return {
        admin: {
          id: adminDoc.id,
          ...adminSemSenha
        },
        token,
        expiresIn: this.jwtExpiration
      };
    } catch (error) {
      throw new Error(`Erro no login: ${error.message}`);
    }
  }

  // Verificar token JWT
  verificarToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  // Buscar administrador por ID
  async obterAdminPorId(id) {
    try {
      const db = getFirestore();
      const doc = await db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const adminData = doc.data();
      const { senha, ...adminSemSenha } = adminData;
      
      return {
        id: doc.id,
        ...adminSemSenha
      };
    } catch (error) {
      throw new Error(`Erro ao buscar administrador: ${error.message}`);
    }
  }

  // Listar administradores
  async listarAdministradores() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collection)
        .orderBy('criado_em', 'desc')
        .get();
      
      const administradores = [];
      snapshot.forEach(doc => {
        const adminData = doc.data();
        const { senha, ...adminSemSenha } = adminData;
        administradores.push({
          id: doc.id,
          ...adminSemSenha
        });
      });
      
      return administradores;
    } catch (error) {
      throw new Error(`Erro ao listar administradores: ${error.message}`);
    }
  }

  // Desativar administrador
  async desativarAdministrador(id) {
    try {
      const db = getFirestore();
      
      await db.collection(this.collection).doc(id).update({
        ativo: false,
        atualizado_em: new Date()
      });

      return { message: 'Administrador desativado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao desativar administrador: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
