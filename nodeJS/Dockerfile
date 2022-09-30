FROM node:16

WORKDIR /usr/src/pingtest_api

COPY ./package.json ./
RUN npm install yarn
RUN yarn global add pm2
RUN yarn install
COPY . .

EXPOSE 3000
CMD ["pm2","start","pingtest_api/src/raspServer.js"]