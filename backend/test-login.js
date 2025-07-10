const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testando login...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@sistema-escolar.com',
      senha: 'Admin123!'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', response.data.data.token);
    console.log('Admin:', response.data.data.admin);
    
    // Testar acesso a rota protegida de alunos
    console.log('\n🧪 Testando acesso a rota protegida de alunos...');
    const alunosResponse = await axios.get('http://localhost:3000/api/alunos', {
      headers: {
        'Authorization': `Bearer ${response.data.data.token}`
      }
    });
    
    console.log('✅ Acesso a alunos bem-sucedido!');
    console.log('Alunos encontrados:', alunosResponse.data.data.length);
    
    // Testar acesso a rota protegida de turmas
    console.log('\n🧪 Testando acesso a rota protegida de turmas...');
    const turmasResponse = await axios.get('http://localhost:3000/api/turmas', {
      headers: {
        'Authorization': `Bearer ${response.data.data.token}`
      }
    });
    
    console.log('✅ Acesso a turmas bem-sucedido!');
    console.log('Turmas encontradas:', turmasResponse.data.data.length);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testLogin();
