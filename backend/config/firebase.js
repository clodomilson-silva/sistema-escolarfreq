const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db = null;
let isInitialized = false;

const initializeFirebase = () => {
  if (isInitialized) {
    console.log('✅ Firebase já está inicializado');
    return db;
  }

  try {
    let serviceAccount;
    let projectId;

    // Primeiro, tentar carregar a partir das variáveis de ambiente
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔧 Carregando credenciais do Firebase a partir das variáveis de ambiente...');
      
      serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
      };
      
      projectId = process.env.FIREBASE_PROJECT_ID;
    } else {
      // Tentar carregar a partir do arquivo JSON
      const credentialsPath = path.join(__dirname, '..', 'firebase-credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        console.log('📁 Carregando credenciais do Firebase a partir do arquivo JSON...');
        serviceAccount = require(credentialsPath);
        projectId = serviceAccount.project_id;
      } else {
        throw new Error('Nenhuma configuração do Firebase encontrada. Configure as variáveis de ambiente ou o arquivo firebase-credentials.json');
      }
    }

    // Verificar se o Firebase Admin já foi inicializado
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId
      });
    }

    db = admin.firestore();
    isInitialized = true;

    console.log('🔥 Firebase inicializado com sucesso!');
    console.log(`📁 Projeto: ${projectId}`);
    
    return db;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error.message);
    
    // Se for erro de parsing da chave privada, tentar modo emulador
    if (error.message.includes('private key') || error.message.includes('ASN.1')) {
      console.log('🔄 Tentando inicializar Firebase em modo desenvolvimento...');
      try {
        // Inicializar em modo de teste/desenvolvimento
        if (admin.apps.length === 0) {
          admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'sistema-escolar-freq'
          });
        }
        
        // Usar Firestore em modo de teste
        db = admin.firestore();
        
        // Configurar para usar emulador se disponível
        if (process.env.FIRESTORE_EMULATOR_HOST) {
          console.log('🧪 Usando emulador do Firestore');
        }
        
        isInitialized = true;
        console.log('🔥 Firebase inicializado em modo desenvolvimento!');
        return db;
      } catch (devError) {
        throw new Error(`Falha na inicialização do Firebase (modo dev): ${devError.message}`);
      }
    } else {
      throw new Error(`Falha na inicialização do Firebase: ${error.message}`);
    }
  }
};

const getFirestore = () => {
  if (!isInitialized || !db) {
    throw new Error('Firebase não foi inicializado. Chame initializeFirebase() primeiro.');
  }
  return db;
};

const getFirebaseAdmin = () => {
  if (!isInitialized) {
    throw new Error('Firebase não foi inicializado. Chame initializeFirebase() primeiro.');
  }
  return admin;
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getFirebaseAdmin
};
