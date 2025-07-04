const admin = require('firebase-admin');
const path = require('path');

let db = null;
let isInitialized = false;

const initializeFirebase = () => {
  if (isInitialized) {
    console.log('✅ Firebase já está inicializado');
    return db;
  }

  try {
    const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
    
    if (!credentialsPath) {
      throw new Error('FIREBASE_CREDENTIALS_PATH não está definido no arquivo .env');
    }

    const serviceAccount = require(path.resolve(credentialsPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });

    db = admin.firestore();
    isInitialized = true;

    console.log('🔥 Firebase inicializado com sucesso!');
    console.log(`📁 Projeto: ${serviceAccount.project_id}`);
    
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
