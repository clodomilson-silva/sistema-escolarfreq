📚 Sistema de Gerenciamento Escolar
Este projeto é um sistema de gerenciamento escolar desenvolvido com Django (backend) e React + TypeScript (frontend). O sistema permite cadastrar, listar, editar e excluir alunos, além de acompanhar suas informações.

🛠 Tecnologias Utilizadas
Frontend
React

TypeScript

React Router

Axios

Vite

Backend
Django

Django Rest Framework (DRF)

PostgreSQL

🚀 Como Rodar o Projeto
1️⃣ Clonar o Repositório
bash
Copiar
Editar
git clone https://github.com/seu-usuario/nome-do-repositorio.git
cd nome-do-repositorio
2️⃣ Configurar o Backend (Django)
Criar um ambiente virtual:

bash
Copiar
Editar
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Instalar as dependências:

bash
Copiar
Editar
pip install -r requirements.txt
Aplicar as migrações:

bash
Copiar
Editar
python manage.py migrate
Criar um superusuário (opcional):

bash
Copiar
Editar
python manage.py createsuperuser
Iniciar o servidor:

bash
Copiar
Editar
python manage.py runserver
3️⃣ Configurar o Frontend (React)
Acessar a pasta do frontend:

bash
Copiar
Editar
cd frontend
Instalar as dependências:

bash
Copiar
Editar
npm install
Rodar o projeto:

bash
Copiar
Editar
npm run dev
📌 Funcionalidades
✅ Cadastro de alunos
✅ Listagem de alunos
✅ Edição de alunos
✅ Exclusão de alunos

📂 Estrutura do Projeto
bash
Copiar
Editar
📂 projeto/
 ├── 📂 backend/           # Backend Django
 │   ├── manage.py         # Gerenciador do Django
 │   ├── settings.py       # Configurações do Django
 │   ├── models.py         # Modelos do banco de dados
 │   ├── views.py          # Lógica da API
 │   └── serializers.py    # Serialização dos dados
 ├── 📂 frontend/          # Frontend React
 │   ├── src/
 │   │   ├── components/   # Componentes reutilizáveis
 │   │   ├── pages/        # Páginas do sistema
 │   │   ├── services/     # Comunicação com API
 │   │   ├── App.tsx       # Componente principal
 │   │   └── main.tsx      # Entrada do React
 │   ├── package.json      # Dependências do projeto
 │   └── vite.config.ts    # Configuração do Vite
 ├── 📄 README.md          # Documentação do projeto
 ├── 📄 requirements.txt   # Dependências do Django
 ├── 📄 .gitignore         # Arquivos ignorados no Git
📌 API Endpoints
Alunos
Método	Endpoint	Descrição
GET	/api/alunos/	Lista todos os alunos
POST	/api/alunos/novo/	Cria um novo aluno
GET	/api/alunos/{id}/	Detalhes de um aluno
PUT	/api/alunos/{id}/	Atualiza um aluno
DELETE	/api/alunos/{id}/	Deleta um aluno
📜 Licença
Este projeto está sob a licença MIT.

📞 Contato
Caso tenha dúvidas ou sugestões, entre em contato:
✉️ Email: profclodomilson@gmail.com
🐙 GitHub: clodomilson
