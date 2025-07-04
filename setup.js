#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Sistema Escolar...\n');

// Verificar se as pastas existem
const folders = ['backend', 'frontend'];
for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    console.error(`❌ Pasta ${folder} não encontrada!`);
    process.exit(1);
  }
}

// Instalar dependências da raiz
console.log('📦 Instalando dependências da raiz...');
execSync('npm install', { stdio: 'inherit' });

// Instalar dependências do backend
console.log('\n🔧 Instalando dependências do backend...');
execSync('cd backend && npm install', { stdio: 'inherit', shell: true });

// Instalar dependências do frontend
console.log('\n⚛️  Instalando dependências do frontend...');
execSync('cd frontend && npm install', { stdio: 'inherit', shell: true });

// Verificar arquivos de configuração
const requiredFiles = [
  'backend/.env',
  'backend/firebase-credentials.json'
];

console.log('\n🔍 Verificando arquivos de configuração...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  Arquivo ${file} não encontrado! Você precisará configurá-lo.`);
  } else {
    console.log(`✅ ${file} encontrado`);
  }
}

console.log('\n✨ Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure o arquivo backend/.env com suas credenciais');
console.log('2. Coloque o arquivo firebase-credentials.json na pasta backend/');
console.log('3. Execute "npm run dev" para iniciar o desenvolvimento');
console.log('\n🎯 Comandos úteis:');
console.log('• npm run dev        - Inicia backend e frontend em modo desenvolvimento');
console.log('• npm run start      - Inicia backend e frontend em modo produção');
console.log('• npm run backend:dev - Inicia apenas o backend');
console.log('• npm run frontend:dev - Inicia apenas o frontend');
console.log('• npm run health     - Verifica se o backend está funcionando');
