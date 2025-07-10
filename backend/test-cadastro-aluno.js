// Script para testar o cadastro de aluno com campos corretos
const axios = require('axios');

async function testarCadastroAluno() {
  try {
    console.log('🧪 Testando cadastro de aluno...\n');

    // 1. Fazer login para obter token
    const loginData = {
      email: "admin@sistema-escolar.com",
      senha: "Admin123!"
    };

    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', loginData);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login realizado com sucesso!');
      console.log(`Token: ${token.substring(0, 20)}...\n`);

      // 2. Cadastrar aluno com apenas campos válidos
      const alunoData = {
        nome: "Maria Santos Teste",
        matricula: "2025999",
        data_nascimento: "1999-05-20",
        email: "maria.teste999@email.com"
      };

      console.log('2️⃣ Cadastrando aluno...');
      console.log('Dados enviados:', alunoData);

      const alunoResponse = await axios.post('http://localhost:3000/api/alunos', alunoData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Aluno cadastrado com sucesso!');
      console.log('Resposta:', alunoResponse.data);

    } else {
      console.log('❌ Erro no login:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testarCadastroAluno();
