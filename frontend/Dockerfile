# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine AS production

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S frontend -u 1001

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
