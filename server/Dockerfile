FROM node:10.13-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY . ./
CMD node src/index.js
