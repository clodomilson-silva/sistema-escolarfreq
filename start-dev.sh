#!/bin/bash

# Script para iniciar Backend Django e Frontend React simultaneamente
# Sistema Escolar - Ambiente de Desenvolvimento

echo "🚀 Iniciando Sistema Escolar..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando servidores...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar se os diretórios existem
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório backend não encontrado!${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório frontend não encontrado!${NC}"
    exit 1
fi

# Verificar se o venv existe
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${RED}❌ Erro: Ambiente virtual não encontrado em backend/venv${NC}"
    echo -e "${YELLOW}Execute: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Instalando dependências...${NC}"
    cd "$FRONTEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📦 Backend Django:${NC} http://localhost:8000"
echo -e "${BLUE}📦 Frontend React:${NC} http://localhost:5173"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8000/swagger/"
echo ""
echo -e "${GREEN}✨ Pressione Ctrl+C para encerrar ambos os servidores${NC}"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Iniciar Backend Django
echo -e "${BLUE}🔧 Iniciando Backend Django...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
python manage.py runserver > /tmp/django.log 2>&1 &
DJANGO_PID=$!

# Aguardar Django iniciar
sleep 3

# Verificar se Django iniciou
if ! kill -0 $DJANGO_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar Django. Verificando logs...${NC}"
    cat /tmp/django.log
    exit 1
fi

echo -e "${GREEN}✅ Backend Django rodando (PID: $DJANGO_PID)${NC}"

# Iniciar Frontend React
echo -e "${BLUE}🔧 Iniciando Frontend React...${NC}"
cd "$FRONTEND_DIR"
npx vite > /tmp/vite.log 2>&1 &
VITE_PID=$!

# Aguardar Vite iniciar
sleep 3

# Verificar se Vite iniciou
if ! kill -0 $VITE_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar Vite. Verificando logs...${NC}"
    cat /tmp/vite.log
    kill $DJANGO_PID
    exit 1
fi

echo -e "${GREEN}✅ Frontend React rodando (PID: $VITE_PID)${NC}"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""
echo -e "${GREEN}🎉 Sistema iniciado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📝 Credenciais de teste:${NC}"
echo "   Email: admin@escola.com"
echo "   Senha: admin123"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo "   Django: tail -f /tmp/django.log"
echo "   Vite:   tail -f /tmp/vite.log"
echo ""
echo -e "${GREEN}Aguardando... (Ctrl+C para encerrar)${NC}"
echo ""

# Manter o script rodando e mostrar logs
tail -f /tmp/django.log -f /tmp/vite.log &
TAIL_PID=$!

# Aguardar indefinidamente
wait $DJANGO_PID $VITE_PID
