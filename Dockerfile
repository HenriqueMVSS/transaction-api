# Imagem base oficial do Node.js
FROM node:16-alpine

# Diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código da aplicação para o diretório de trabalho
COPY . .

# Compila o projeto
RUN npm run build

# Expõe a porta que a aplicação irá rodar
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "run", "start:prod"]