FROM node:18-alpine AS base

WORKDIR /app
COPY package.json ./

RUN npm i

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]