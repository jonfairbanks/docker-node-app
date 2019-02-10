FROM node:8

# App Directory
WORKDIR /usr/src/app

# Install Dependencies
RUN npm i yarn pm2 -g

COPY package*.json yarn*.json ./
RUN  yarn install

# Bundle Source
COPY . .

# Application Port
EXPOSE 8080

CMD [ "pm2-runtime", "server.js" ]