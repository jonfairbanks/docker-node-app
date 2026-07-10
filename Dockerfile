# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
ENV NPM_CONFIG_ENGINE_STRICT=true
RUN apk add --no-cache tini
WORKDIR /app

FROM base AS dependencies
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM dependencies AS development
COPY . .
EXPOSE 8080 9229
CMD ["npm", "run", "dev"]

FROM dependencies AS test
COPY . .
RUN npm run lint && npm test

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node app.js index.js ./
COPY --chown=node:node public ./public
COPY --chown=node:node views ./views
USER node
EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
