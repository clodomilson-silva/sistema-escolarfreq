# Setup do Backend Node.js + Firebase

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Projeto Firebase configurado
- Arquivo de credenciais do Firebase

## 🚀 Instalação

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar Firebase:**
   - Baixe o arquivo de credenciais do Firebase Console
   - Renomeie para `firebase-credentials.json`
   - Coloque na pasta `backend/`

3. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env` e ajuste as configurações
   - Certifique-se que `FIREBASE_CREDENTIALS_PATH` aponta para o arquivo correto

4. **Iniciar o servidor:**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 🌐 Endpoints Disponíveis

### Health Check
- `GET /health` - Verificar status do servidor

### Alunos
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos/count` - Contar alunos
- `GET /api/alunos/:id` - Obter aluno por ID
- `GET /api/alunos/matricula/:matricula` - Obter aluno por matrícula
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Excluir aluno

### Turmas
- `GET /api/turmas` - Listar turmas
- `GET /api/turmas/:id` - Obter turma por ID
- `POST /api/turmas` - Criar nova turma
- `PUT /api/turmas/:id` - Atualizar turma
- `DELETE /api/turmas/:id` - Excluir turma
- `POST /api/turmas/:id/alunos/:alunoId` - Adicionar aluno à turma
- `DELETE /api/turmas/:id/alunos/:alunoId` - Remover aluno da turma

### Autorizações (Em desenvolvimento)
- `GET /api/autorizacoes` - Listar autorizações
- `POST /api/autorizacoes` - Criar autorização
- `GET /api/autorizacoes/:id` - Obter autorização
- `PUT /api/autorizacoes/:id` - Atualizar autorização
- `DELETE /api/autorizacoes/:id` - Excluir autorização

### Frequência (Em desenvolvimento)
- `GET /api/frequencia` - Listar registros de frequência
- `POST /api/frequencia` - Registrar frequência
- `GET /api/frequencia/:id` - Obter registro de frequência
- `PUT /api/frequencia/:id` - Atualizar frequência
- `DELETE /api/frequencia/:id` - Excluir registro de frequência

## 📝 Exemplo de Uso

### Criar um aluno:
```bash
curl -X POST http://localhost:8000/api/alunos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "matricula": "2025001",
    "data_nascimento": "2000-01-15",
    "email": "joao.silva@exemplo.com",
    "telefone": "(11) 99999-9999"
  }'
```

### Criar uma turma:
```bash
curl -X POST http://localhost:8000/api/turmas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "1º Ano A",
    "ano": 1,
    "turno": "matutino",
    "professor_responsavel": "Maria Santos",
    "capacidade_maxima": 30
  }'
```

## 🔧 Estrutura do Projeto

```
backend/
├── config/
│   └── firebase.js          # Configuração do Firebase
├── middleware/
│   ├── errorHandler.js      # Tratamento de erros
│   └── notFound.js          # Middleware para rotas não encontradas
├── routes/
│   ├── alunos.js           # Rotas dos alunos
│   ├── turmas.js           # Rotas das turmas
│   ├── autorizacoes.js     # Rotas das autorizações
│   └── frequencia.js       # Rotas da frequência
├── services/
│   ├── alunoService.js     # Lógica de negócio dos alunos
│   └── turmaService.js     # Lógica de negócio das turmas
├── validators/
│   ├── alunoValidator.js   # Validação dos dados dos alunos
│   ├── turmaValidator.js   # Validação dos dados das turmas
│   ├── autorizacaoValidator.js
│   └── frequenciaValidator.js
├── .env                     # Variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── package.json            # Dependências e scripts
└── server.js               # Arquivo principal do servidor
```

## 🔒 Segurança

- Rate limiting configurado
- Helmet.js para headers de segurança
- CORS configurado
- Validação de dados com Joi
- Tratamento de erros centralizado

## 🚀 Deploy

Para produção, configure:
1. Variável `NODE_ENV=production`
2. Configure um servidor web (nginx) como proxy reverso
3. Use PM2 ou similar para gerenciar o processo
4. Configure SSL/TLS

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o Firebase está configurado corretamente
3. Verifique os logs do servidor para mais detalhes
