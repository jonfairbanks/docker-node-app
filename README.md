# docker-node-app

![Docker+Node](https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/logo.jpg)

[![CI](https://github.com/jonfairbanks/docker-node-app/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/jonfairbanks/docker-node-app/actions/workflows/ci.yaml)
![GitHub top language](https://img.shields.io/github/languages/top/jonfairbanks/docker-node-app.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/jonfairbanks/docker-node-app.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jonfairbanks/docker-node-app.svg)
![Lines of code](https://img.shields.io/tokei/lines/github/jonfairbanks/docker-node-app)
![License](https://img.shields.io/github/license/jonfairbanks/docker-node-app.svg?style=flat)

## A sample Node.js app in Docker

- Uses Node.js 24 LTS
- Reproducible npm installs from the committed lockfile
- Runs as a non-root user for enhanced security
- Multi-stage development, test, and production images
- Snyk dependency scanning and CodeQL security checks in CI
- Properly handles `SIGINT` and `SIGTERM` events with [tini](https://github.com/krallin/tini)

### Local development

With Node.js 24 installed:

```shell
npm ci
npm test
npm run lint
npm run dev
```

Or run the development container with live source mounts:

```shell
docker compose up --build
```

### Docker

This application is also available on [Dockerhub](https://hub.docker.com/r/jonfairbanks/docker-node-app).

To launch the container:

```shell
docker run -d -p 8080:8080 --name docker-node-app jonfairbanks/docker-node-app:latest
```

To verify its health:

```shell
curl --fail http://localhost:8080/healthz
```

### Kubernetes

You can find this app on [Helm](https://jonfairbanks.github.io/helm-charts/)!

This application can also be helpful verifying Kubernetes:

- Scaling and Downtime Mitigation
- Cluster Load Balancing
- Request IP Passthrough

Validate or install the bundled chart with Helm 3:

```shell
helm lint chart
helm upgrade --install docker-node-app chart
```

For testing that pods are balancing correctly, you can make multiple requests to your app to verify.

To make 50 requests and write them to a file, you can run the following with your endpoint:

```shell
for run in {1..50}; do curl -sSL -D - docker-node-app.local -o /dev/null | grep X-Hostname; done
```
