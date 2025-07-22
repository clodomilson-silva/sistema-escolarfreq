// Script para testar o fluxo de login e redirecionamento
console.log('🧪 Testando fluxo de login...');

// Simular um login através do console do navegador
const testarLogin = async () => {
  try {
    console.log('1️⃣ Tentando fazer login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sistema-escolar.com',
        senha: 'Admin123!'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('📊 Dados retornados:', data);
      
      // Verificar se o token é válido
      console.log('2️⃣ Verificando token...');
      const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${data.data.token}`
        }
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        console.log('✅ Token válido!');
        console.log('📋 Dados do admin:', verifyData.data.admin);
      } else {
        console.log('❌ Token inválido:', verifyData);
      }
      
    } else {
      console.log('❌ Login falhou:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar o teste
testarLogin();

console.log('💡 Para testar no navegador:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Cole este código');
console.log('3. Observe se o login e verificação funcionam');
console.log('4. Teste o redirecionamento na interface');
