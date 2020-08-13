# docker-node-app

![Docker+Node](https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/logo.jpg)

![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/jonfairbanks/docker-node-app.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/jonfairbanks/docker-node-app.svg)
![GitHub top language](https://img.shields.io/github/languages/top/jonfairbanks/docker-node-app.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/jonfairbanks/docker-node-app.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jonfairbanks/docker-node-app.svg)
![Dependabot Status](https://camo.githubusercontent.com/35a144257b9aec7d472244f972d918c3926d5518/68747470733a2f2f6170692e646570656e6461626f742e636f6d2f6261646765732f7374617475733f686f73743d676974687562267265706f3d79737331342f6d757369637368617265)
![License](https://img.shields.io/github/license/jonfairbanks/docker-node-app.svg?style=flat)

#### A sample Node.js app in Docker

- Final Image Size: ~55MB
- Includes the latest versions of Node, NPM and Yarn
- Runs as a non-root user for enhanced security
- Multi-stage including development, test, audit and production environments
- Scan and audit dependencies with [Microscanner](https://www.aquasec.com/news/microscanner-new-free-image-vulnerability-scanner-for-developers/)
- Properly handles `SIGINT` and `SIGTERM` events with [tini](https://github.com/krallin/tini)
- Follows many development, virtualization and styling best-practices

##### Docker

This application is also available on [Dockerhub](https://hub.docker.com/r/jonfairbanks/docker-node-app).

To launch the container: 
`docker run -d -p 8080:8080 --name docker-node-app jonfairbanks/docker-node-app`

To attach to a running container:
`docker exec -it docker-node-app /bin/ash`

##### Kubernetes

You can find this app on [Helm](https://jonfairbanks.github.io/helm-charts/)!

This application can also be helpful verifying Kubernetes:
- Scaling and Downtime Mitigation
- Cluster Load Balancing
- Request IP Passthrough

To deploy this app into a pre-existing cluster, simply run:
`kubectl apply -f docker-node-app.yaml`

For testing that pods are balancing correctly, you can make multiple requests to your app to verify.

To make 50 requests and write them to a file, you can run the following with your endpoint:
`for run in {1..50}; do curl -sSL -D - kube.fairbanks.dev -o /dev/null | grep X-Hostname; done`

##### ARM Support

This application also has an experimental `jonfairbanks/docker-node-app:buildx` tag which supports both x86 and ARM based platforms. For more details, checkout the [ARM Documentation](https://github.com/jonfairbanks/docker-node-app/blob/master/ARM.md).