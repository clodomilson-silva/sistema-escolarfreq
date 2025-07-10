require('dotenv').config();
const { initializeFirebase } = require('../config/firebase');
const authService = require('../services/authService');

async function criarPrimeiroAdmin() {
  try {
    console.log('🚀 Inicializando Firebase...');
    initializeFirebase();
    
    console.log('👤 Criando primeiro administrador...');
    
    const primeiroAdmin = {
      nome: 'Administrador Principal',
      email: 'admin@sistema-escolar.com',
      senha: 'Admin123!'
    };
    
    const administrador = await authService.criarAdministrador(primeiroAdmin);
    
    console.log('✅ Primeiro administrador criado com sucesso!');
    console.log(`📧 Email: ${primeiroAdmin.email}`);
    console.log(`🔐 Senha: ${primeiroAdmin.senha}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('');
    console.log('🔗 Faça login em: http://localhost:5173/login');
    
  } catch (error) {
    if (error.message.includes('já está em uso')) {
      console.log('ℹ️  Administrador principal já existe!');
      console.log('📧 Email: admin@sistema-escolar.com');
      console.log('🔐 Senha padrão: Admin123!');
    } else {
      console.error('❌ Erro ao criar administrador:', error.message);
    }
  }
  
  process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
  criarPrimeiroAdmin();
}

module.exports = criarPrimeiroAdmin;
