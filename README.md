# 📚 Sistema de Gerenciamento Escolar

Sistema completo para gerenciamento escolar desenvolvido com **Node.js + Express** no backend, **React + TypeScript** no frontend e **Firebase Firestore** como banco de dados.

## 🚀 Tecnologias

### Backend
- **Node.js** com Express
- **Firebase Firestore** (banco de dados)
- **Joi** (validação)
- **Helmet, CORS, Rate Limiting** (segurança)
- **Morgan** (logging)
- **Nodemon** (desenvolvimento)

### Frontend
- **React 19** com TypeScript
- **Vite** (build tool)
- **React Router** (navegação)
- **Axios** (requisições HTTP)

## 📋 Funcionalidades

- ✅ **Gestão de Alunos** - CRUD completo
- ✅ **Gestão de Turmas** - CRUD completo  
- 🚧 **Autorizações** - Em desenvolvimento
- 🚧 **Controle de Frequência** - Em desenvolvimento

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm
- Conta Firebase com projeto configurado

### Configuração Rápida

1. **Clone o repositório**
```bash
git clone https://github.com/Clodomilson/sistema-escolarfreq.git
cd sistema-escolarfreq
```

2. **Execute o setup automático**
```bash
npm install
npm run setup
```

3. **Configure as credenciais do Firebase**
   - Coloque o arquivo `firebase-credentials.json` na pasta `backend/`
   - Configure o arquivo `backend/.env` (use `backend/.env.example` como referência)

4. **Inicie o desenvolvimento**
```bash
npm run dev
```

O comando acima irá:
- Iniciar o backend em `http://localhost:3000`
- Aguardar o backend estar pronto
- Iniciar o frontend em `http://localhost:5173`

## 🎯 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia backend + frontend juntos
npm run backend:dev      # Apenas backend (modo desenvolvimento)
npm run frontend:dev     # Apenas frontend (modo desenvolvimento)
```

### Produção
```bash
npm run start           # Inicia backend + frontend (produção)
npm run build          # Build do projeto completo
```

### Utilitários
```bash
npm run setup          # Configuração inicial completa
npm run health         # Verifica se backend está funcionando
npm run test           # Executa testes
npm run clean          # Remove node_modules
```

## 📊 Estrutura do Projeto

```
sistema-escolarfreq/
├── backend/                 # Backend Node.js
│   ├── config/             # Configurações Firebase
│   ├── middleware/         # Middlewares Express
│   ├── routes/             # Rotas da API
│   ├── services/           # Lógica de negócio
│   ├── validators/         # Validação Joi
│   ├── server.js           # Servidor principal
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas/Componentes
│   │   ├── services/      # API calls
│   │   └── assets/        # Recursos estáticos
│   └── package.json
├── package.json           # Scripts do projeto
└── setup.js              # Script de configuração
```

## 🔧 API Endpoints

### Alunos
- `GET /api/alunos` - Lista todos os alunos
- `GET /api/alunos/:id` - Busca aluno por ID
- `POST /api/alunos` - Cria novo aluno
- `PUT /api/alunos/:id` - Atualiza aluno
- `DELETE /api/alunos/:id` - Remove aluno

### Turmas
- `GET /api/turmas` - Lista todas as turmas
- `GET /api/turmas/:id` - Busca turma por ID
- `POST /api/turmas` - Cria nova turma
- `PUT /api/turmas/:id` - Atualiza turma
- `DELETE /api/turmas/:id` - Remove turma

### Sistema
- `GET /api/health` - Health check do sistema

## 🔐 Configuração Firebase

1. Crie um projeto no Firebase Console
2. Ative o Firestore Database
3. Gere uma chave de serviço em "Configurações do Projeto > Contas de Serviço"
4. Baixe o arquivo JSON e renomeie para `firebase-credentials.json`
5. Configure as variáveis de ambiente no arquivo `.env`

## 📝 Exemplo de .env

```env
NODE_ENV=development
PORT=3000
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY_ID=sua-chave-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-chave-privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

## 🐛 Solução de Problemas

### Backend não inicia
- Verifique se o arquivo `firebase-credentials.json` está na pasta `backend/`
- Confirme se as variáveis de ambiente estão configuradas corretamente
- Execute `npm run backend:dev` para ver logs detalhados

### Frontend não conecta com backend
- Verifique se o backend está rodando em `http://localhost:3000`
- Confirme se não há firewall bloqueando as portas
- Execute `npm run health` para testar a conexão

### Erros de Firebase
- Confirme se o projeto Firebase está ativo
- Verifique se o Firestore está habilitado
- Confirme se as credenciais são válidas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Sistema desenvolvido com ❤️ para facilitar a gestão escolar**
