# docker-node-app

![Docker+Node](https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/logo.jpg)

![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/jonfairbanks/docker-node-app.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/jonfairbanks/docker-node-app.svg)
![GitHub top language](https://img.shields.io/github/languages/top/jonfairbanks/docker-node-app.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/jonfairbanks/docker-node-app.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jonfairbanks/docker-node-app.svg)
![License](https://img.shields.io/github/license/jonfairbanks/docker-node-app.svg?style=flat)
#### A sample Node.js app in Docker

- Final Image Size: 61MB
- Includes the latest versions of Node, NPM and Yarn
- Runs as a non-root user
- Multi-stage including development, test, audit and production environments
- Enforces code styling via ESLint & Airbnb styling
- Scan and audit dependencies with [Microscanner](https://www.aquasec.com/news/microscanner-new-free-image-vulnerability-scanner-for-developers/)
- Properly handles `SIGINT` and `SIGTERM` events with [tini](https://github.com/krallin/tini)

To boot the container: 
`docker run -it -p 3000:8080 --name sample-app jonfairbanks/docker-node-app`

To attach to a running container:
`docker exec -it sample-app /bin/ash`

To deploy this app into a pre-existing Kubernetes instance:
`kubectl apply -f docker-node-app.yaml`

This application is also available from Dockerhub under [jonfairbanks/docker-node-app](https://hub.docker.com/r/jonfairbanks/docker-node-app)
