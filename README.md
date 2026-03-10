# 📚 Sistema de Gerenciamento Escolar

Sistema completo para gerenciamento escolar desenvolvido com **Django + PostgreSQL** no backend e **React + TypeScript** no frontend.

## 🚀 Tecnologias

### Backend
- **Django 5.0.1** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Banco de dados relacional
- **JWT** (Simple JWT) - Autenticação
- **Docker** - Containerização
- **Gunicorn** - Servidor WSGI para produção

### Frontend
- **React 19** com TypeScript
- **Vite** (build tool)
- **React Router** (navegação)
- **Axios** (requisições HTTP)

## 📋 Funcionalidades

- ✅ **Gestão de Usuários** - Sistema de autenticação com JWT
- ✅ **Gestão de Alunos** - CRUD completo
- ✅ **Gestão de Turmas** - CRUD completo com relacionamento ManyToMany
- ✅ **Autorizações** - Sistema completo de autorizações
- ✅ **Controle de Frequência** - Registro e estatísticas de frequência

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- Docker & Docker Compose (recomendado)

### Opção 1: Docker (Recomendado)

1. **Clone o repositório**
```bash
git clone https://github.com/Clodomilson/sistema-escolarfreq.git
cd sistema-escolarfreq
```

2. **Configure o arquivo .env do backend**
```bash
cd backend
cp .env.example .env
# Edite o .env se necessário
cd ..
```

3. **Inicie com Docker Compose (Desenvolvimento)**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

Ou **Produção:**
```bash
docker-compose up --build
```

4. **Crie o primeiro administrador**
```bash
# Em outro terminal
docker-compose exec backend-dev python criar_admin.py
# ou para produção
docker-compose exec backend python criar_admin.py
```

O sistema estará disponível em:
- Frontend: `http://localhost:5173` (dev) ou `http://localhost` (prod)
- Backend API: `http://localhost:8000`
- Admin Django: `http://localhost:8000/admin`
- API Docs: `http://localhost:8000/swagger/`

### Opção 2: Instalação Local

#### Backend

1. **Criar ambiente virtual**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Instalar dependências**
```bash   # Backend Django
│   ├── config/                # Configurações do projeto
│   │   ├── settings.py        # Configurações principais
│   │   ├── urls.py           # URLs principais
│   │   └── exceptions.py     # Tratamento de exceções
│   ├── core/                  # App de autenticação
│   │   ├── models.py         # Modelo User customizado
│   │   ├── views.py          # Views de autenticação
│   │   └── serializers.py    # Serializers JWT
│   ├── alunos/               # App de alunos
│   │   ├── models.py         # Modelo Aluno
│   │   ├── views.py          # ViewSet de alunos
│   │   └── serializers.py    # Serializers de alunos
│   ├── turmas/               # App de turmas
│   │   ├── models.py         # Modelos Turma e Autorizacao
│   │   ├── views.py          # ViewSets
│   │   └── serializers.py    # Serializers
│   ├── frequencia/           # App de frequência
│   │   ├── models.py         # Modelo Frequencia
│   │   ├── views.py          # ViewSet com estatísticas
│   │   └── serializers.py    # Serializers
│   ├── manage.py             # CLI do Django
│   ├── criar_admin.py        # Script para criar admin
│   ├── requirements.txt      # Dependências Python
│   └── Dockerfile            # Container Backend
├── frontend/   

4. **Executar migrações**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Criar superusuário**
```bash
python criar_admin.py
# ou
python manage.py createsuperuser
```

6. **Executar servidor**
```bash
python manage.py runserver
```

#### Frontend

1. **Instalar dependências**
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente**
```bash
# Certifique-se que o VITE_API_URL aponta para http://localhost:8000
```

3. **Executar desenvolvimento**
```bash
npm run dev
```

## 🎯 Scripts Disponíveis

### Docker
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up        # Iniciar
docker-compose -f docker-compose.dev.yml down      # Parar

# Produção
docker-compose up                                  # Iniciar
docker-compose down                                # Parar

# Executar comandos no container
docker-compose exec backend-dev python manage.py migrate
docker-compose exec backend-dev python manage.py createsuperuser
docker-compose exec backend-dev python criar_admin.py
```

### Backend (Local)
```bash
python manage.py runserver        # Servidor de desenvolvimento
python manage.py migrate          # Executar migrações
python manage.py makemigrations   # Criar migrações
python manage.py test             # Executar testes
python criar_admin.py             # Criar administrador
```

### Frontend
```bash
npm run dev                       # Servidor de desenvolvimento
npm run build                     # Build para produção
npm run preview                   # Preview da build
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
│   │   ├── contexts/      # Contexts (Auth)
│   │   └── assets/        # Recursos estáticos
│   └── package.json
├── docker-compose.yml         # Docker Compose produção
├── docker-compose.dev.yml     # Docker Compose desenvolvimento
└── README.md                  # Este arquivo
```

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/login/` - Login (retorna JWT token)
- `POST /api/auth/register/` - Criar usuário (admin only)
- `GET /api/auth/me/` - Informações do usuário atual
- `GET /api/auth/verify/` - Verificar token
- `POST /api/auth/token/refresh/` - Refresh token

### Alunos
- `GET /api/alunos/` - Lista todos os alunos
- `GET /api/alunos/{id}/` - Busca aluno por ID
- `POST /api/alunos/` - Cria novo aluno
- `PUT /api/alunos/{id}/` - Atualiza aluno
- `DELETE /api/alunos/{id}/` - Remove aluno
- `GET /api/alunos/count/` - Contagem de alunos
- `GET /api/alunos/search/?q=termo` - Buscar alunos

### Turmas
- `GET /api/turmas/` - Lista todas as turmas
- `GET /api/turmas/{id}/` - Busca turma por ID
- `POST /api/turmas/` - Cria nova turma
- `PUT /api/turmas/{id}/` - Atualiza turma
- `DELETE /api/turmas/{id}/` - Remove turma
- `POST /api/turmas/{id}/add_aluno/` - Adicionar aluno à turma
- `POST /api/turmas/{id}/remove_aluno/` - Remover aluno da turma
- `GET /api/turmas/count/` - Contagem de turmas

### Frequência
- `GET /api/frequencia/` - Lista frequências
- `POST /api/frequencia/` - Registrar frequência
- `PUT /api/frequencia/{id}/` - Atualizar frequência
- `DELETE /api/frequencia/{id}/` - Remover frequência
- `POST /api/frequencia/bulk_create/` - Criar múltiplas frequências
- `GET /api/frequencia/turma/?turma_id=1&data=2024-03-10` - Por turma/data
- `GET /api/frequencia/aluno/?aluno_id=1` - Por aluno
- `GET /api/frequencia/estatisticas/?aluno_id=1` - Estatísticas

### Autorizações
- `GET /api/turmas/autorizacoes/` - Lista autorizações
- `POST /api/turmas/autorizacoes/` - Criar autorização
- `PUT /api/turmas/autorizacoes/{id}/` - Atualizar autorização
- `DELETE /api/turmas/autorizacoes/{id}/` - Remover autorização

### Sistema
- `GET /health/` - Health check do sistema
- `GET /swagger/` - Documentação Swagger
- `GET /redoc/` - Documentação ReDoc
- `GET /admin/` - Admin Django

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. Faça login em `/api/auth/login/` com email e senha
2. Receba um token JWT
3. Inclua o token em todas as requisições:
```
Authorization: Bearer <seu-token>
```

## 📝 Modelos de Dados

### User
```python
- email (unique)
- nome
- role: 'admin' | 'professor'
- disciplinas: array
- is_active
```

### Aluno
```python
- nome
- matricula (unique)
- email (unique)
- data_nascimento
- telefone, endereco
- responsavel, telefone_responsavel
```

### Turma
```python
- nome (unique)
- ano
- turno: 'matutino' | 'vespertino' | 'noturno' | 'integral'
- disciplina
- professor, sala
- alunos: ManyToMany
- horarios: JSON
- dias_letivos: JSON
- status: 'ativa' | 'inativa' | 'concluida'
```

### Frequencia
```python
- turma (FK)
- aluno (FK)
- data
- disciplina
- status: 'presente' | 'ausente' | 'justificado'
- observacoes
```

### Autorizacao
```python
- turma (FK)
- aluno (FK)
- tipo: 'saida_antecipada' | 'ausencia' | 'atividade_externa' | 'outro'
- data
- motivo
- status: 'pendente' | 'aprovada' | 'rejeitada'
```

## 🐛 Solução de Problemas

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Confirme se as variáveis de ambiente estão configuradas corretamente
- Execute as migrações: `python manage.py migrate`
- Verifique os logs: `docker-compose logs backend-dev`

### Frontend não conecta com backend
- Verifique se o backend está rodando em `http://localhost:8000`
- Confirme se a variável `VITE_API_URL` está correta
- Verifique se não há firewall bloqueando as portas
- Teste o health check: `curl http://localhost:8000/health/`

### Erros de Database
- Confirme se o PostgreSQL está rodando
- Verifique as credenciais de conexão no `.env`
- Execute: `python manage.py migrate --run-syncdb`
- Teste a conexão: `docker-compose exec db-dev psql -U postgres -d sistema_escolar`

### Problemas com Docker
- Limpe os containers: `docker-compose down -v`
- Rebuild: `docker-compose up --build`
- Verifique os logs: `docker-compose logs -f`

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
