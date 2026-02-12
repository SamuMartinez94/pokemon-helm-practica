FROM node:20

WORKDIR /app

#Copia package.json y package-lock.json
COPY package*.json ./

#Instala dependencias
RUN npm install

#Copia archivos de la app
COPY . .

#Puerto 3000
EXPOSE 3000

#Arrancar la app
CMD ["node", "server.js"]
