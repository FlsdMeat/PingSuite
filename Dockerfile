FROM node:16

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install yarn
RUN yarn install 
COPY . .

EXPOSE 8080
CMD ["node","src/raspServer.js"]