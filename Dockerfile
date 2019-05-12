FROM mhart/alpine-node

# Run as Non-Root
RUN adduser -D -u 1000 appuser \
    && mkdir -p /usr/src/app \
    && chown -R appuser /usr/src/app /usr/lib/node_modules
USER appuser
WORKDIR /usr/src/app

# Quietly Install Dependencies
ENV NPM_CONFIG_PREFIX=/usr/src/app/.npm-global
COPY package*.json yarn*.* ./
RUN  yarn install --production --silent

# Bundle App Source
COPY . .

# Internal Application Port
EXPOSE 8080

CMD [ "node", "server.js" ]
