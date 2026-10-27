# docker-node-app

![Docker+Node](https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/logo.jpg)

[![CI](https://github.com/jonfairbanks/docker-node-app/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/jonfairbanks/docker-node-app/actions/workflows/ci.yaml)
![GitHub top language](https://img.shields.io/github/languages/top/jonfairbanks/docker-node-app.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/jonfairbanks/docker-node-app.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jonfairbanks/docker-node-app.svg)
![Lines of code](https://img.shields.io/tokei/lines/github/jonfairbanks/docker-node-app)
![License](https://img.shields.io/github/license/jonfairbanks/docker-node-app.svg?style=flat)

## A sample Node.js app in Docker

- Uses Node.js 26
- Reproducible npm installs from the committed lockfile
- Runs as a non-root user for enhanced security
- Multi-stage development, test, and production images
- Snyk dependency scanning and CodeQL security checks in CI
- Properly handles `SIGINT` and `SIGTERM` events with [tini](https://github.com/krallin/tini)

### Local development

With Node.js 26 installed:

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

### Automatic Production Releases

Changes merge into `develop`, then promote to the production branch `master`.
After the required checks pass, GitHub Actions publishes the production image
as `jonfairbanks/docker-node-app:latest` and an immutable commit tag.

The home cluster's Argo CD Image Updater follows `latest`, records its digest
in Git automatically, and Argo CD rolls the deployment. App-only releases need
no manual cluster-state edit or Helm chart version bump. The `develop` image
tag is kept separate from production.

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

The chart sets the pod timezone to `America/Los_Angeles`. Override it with an
IANA timezone name when deploying elsewhere:

```shell
helm upgrade --install docker-node-app chart --set timezone=Europe/London
```

For testing that pods are balancing correctly, you can make multiple requests to your app to verify.

To make 50 requests and write them to a file, you can run the following with your endpoint:

```shell
for run in {1..50}; do curl -sSL -D - docker-node-app.local -o /dev/null | grep X-Hostname; done
```

### Shutdown Coordination

By default, `SIGTERM` and `SIGINT` immediately stop accepting new connections
and allow active requests up to `SHUTDOWN_TIMEOUT_MS` (25000 milliseconds).

For Kubernetes, set `SHUTDOWN_READINESS_TIMEOUT_MS` to a positive deadline
(such as 6000 milliseconds) to keep serving normally until the next successful
`/readyz` response to a `kube-probe/` client finishes. Shutdown then marks the
app draining and closes the listener. Other clients and unsuccessful readiness
responses do not release this wait. Readiness still returns 503 while draining;
liveness and probe thresholds are unchanged.

If no eligible response finishes before the deadline, the app logs the missed
coordination and starts its normal bounded drain. Allow enough pod termination
time for any pre-stop hook, this wait, the drain deadline, and a safety margin.
A five-second pre-stop hook, six-second readiness wait, and 25-second drain
require a grace period greater than 36 seconds, such as 40 seconds.

This coordinates exit with an observed check to reduce shutdown probe races.
It does not guarantee zero warnings: kubelet can trigger additional checks,
active requests can outlast the probe interval, and runtime teardown can be slow.
The client header identifies kubelet's normal probe format, not authenticated
identity. It only affects coordination after a shutdown signal.
