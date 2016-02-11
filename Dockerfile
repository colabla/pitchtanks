FROM node:5.4.1-slim

COPY package.json tmp/package.json

RUN cd /tmp && npm install && cp -a /tmp/node_modules /

COPY . /

EXPOSE 8080
