// Script para criar um professor de teste
require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Inicializa Firebase
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function criarProfessorTeste() {
  try {
    const email = 'professor@sistema-escolar.com';
    const senha = 'Professor123!';
    const nome = 'Professor Teste';
    const disciplinas = ['Matemática', 'Física', 'Química'];

    // Verifica se já existe
    const snapshot = await db.collection('administradores')
      .where('email', '==', email)
      .get();

    if (!snapshot.empty) {
      console.log('❌ Professor de teste já existe!');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', senha);
      process.exit(0);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Cria o professor
    const professorRef = await db.collection('administradores').add({
      nome: nome,
      email: email,
      senha: senhaHash,
      role: 'professor',
      disciplinas: disciplinas,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Professor de teste criado com sucesso!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('👤 Nome:', nome);
    console.log('🎓 Role: professor');
    console.log('📚 Disciplinas:', disciplinas.join(', '));
    console.log('🆔 ID:', professorRef.id);
    console.log('═══════════════════════════════════════');
    console.log('🌐 Acesse: http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar professor:', error.message);
    process.exit(1);
  }
}

criarProfessorTeste();
