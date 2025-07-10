const admin = require('firebase-admin');
require('dotenv').config();

let db = null;
let isInitialized = false;

const initializeFirebase = () => {
  if (isInitialized) {
    console.log('✅ Firebase já está inicializado');
    return db;
  }

  try {
    // Validar se todas as variáveis de ambiente necessárias estão definidas
    const requiredEnvVars = [
      'FIREBASE_TYPE',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_AUTH_URI',
      'FIREBASE_TOKEN_URI',
      'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
      'FIREBASE_CLIENT_X509_CERT_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente do Firebase não definidas: ${missingVars.join(', ')}`);
    }

    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    db = admin.firestore();
    isInitialized = true;

    console.log('🔥 Firebase inicializado com sucesso!');
    console.log(`📁 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    
    return db;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error.message);
    throw new Error(`Falha na inicialização do Firebase: ${error.message}`);
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
