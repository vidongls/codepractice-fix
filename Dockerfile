FROM node:14.17.3

WORKDIR /usr/src/app
COPY . .
RUN npm install

EXPOSE 5000
CMD [ "node", "index.js" ]