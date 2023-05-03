# Base
FROM node:lts-alpine as base
RUN apk -q update; apk -q install wget gpg -y
ENV NODE_ENV=production
RUN set -eux; \
  dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
  export TINI_VERSION='0.19.0'; \
  wget -O /usr/local/bin/tini "https://github.com/krallin/tini/releases/download/v$TINI_VERSION/tini-$dpkgArch"; \
  wget -O /usr/local/bin/tini.asc "https://github.com/krallin/tini/releases/download/v$TINI_VERSION/tini-$dpkgArch.asc"; \
  export GNUPGHOME="$(mktemp -d)"; \
  gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys 6380DC428747F6C393FEACA59A84159D7001A4E5; \
  gpg --batch --verify /usr/local/bin/tini.asc /usr/local/bin/tini; \
  gpgconf --kill all; \
  rm -r "$GNUPGHOME" /usr/local/bin/tini.asc; \
  chmod +x /usr/local/bin/tini; \
  tini -h;
RUN apk del -q wget gnupg && \
    apk -q autoremove && \
    apk -q clean && \
    rm -rf /var/cache/apk/*
RUN npm i npm@latest -g
# apt-get is unavailable after this point
EXPOSE 8080
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package*.json ./
RUN  npm install --no-optional --silent && npm cache clean --force > "/dev/null" 2>&1

# Development ENV
FROM base as dev
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH
RUN npm install --only=development --no-optional --silent && npm cache clean --force > "/dev/null" 2>&1
CMD ["nodemon", "index.js", "--inspect=0.0.0.0:9229"]

# Source
FROM base as source
COPY --chown=node:node . .

# Test ENV
FROM source as test
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH
COPY --from=dev /app/node_modules /app/node_modules
RUN eslint .
RUN npm test

# Audit ENV
FROM test as audit
USER root
RUN npm audit --audit-level critical
ARG MICROSCANNER_TOKEN
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
RUN /microscanner $MICROSCANNER_TOKEN --continue-on-failure

# Production ENV
FROM source as prod
ENTRYPOINT ["/tini", "--"]
CMD ["node", "index.js"]
