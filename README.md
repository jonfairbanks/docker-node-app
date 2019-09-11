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
- Runs as a non-root user for enhanced security
- Multi-stage including development, test, audit and production environments
- Scan and audit dependencies with [Microscanner](https://www.aquasec.com/news/microscanner-new-free-image-vulnerability-scanner-for-developers/)
- Properly handles `SIGINT` and `SIGTERM` events with [tini](https://github.com/krallin/tini)
- Follows many development, virtualization and styling best-practices

##### Docker

This application is also available on [Dockerhub](https://hub.docker.com/r/jonfairbanks/docker-node-app).

To launch the container: 
`docker run -it -p 8080:8080 --name docker-node-app jonfairbanks/docker-node-app`

To attach to a running container:
`docker exec -it docker-node-app /bin/ash`

##### Kubernetes

This application can also be helpful verifying Kubernetes:
- Scaling and Downtime Mitigation
- Cluster Load Balancing
- Request IP Passthrough

To deploy this app into a pre-existing cluster, simply run:
`kubectl apply -f docker-node-app.yaml`

For testing that pods are balancing correctly, you can make multiple requests to your app to verify.

To make 50 requests and write them to a file, you can run the following with your endpoint:
`for run in {1..50}; do curl -w "\n" -I https://kube.fairbanks.dev | grep X-Hostname >> docker-node-app.log; done`

##### ARM Support

This application also has an experimental `jonfairbanks/docker-node-app:buildx` tag which supports both x86 and ARM based platforms. This was created using Docker v19's BuildKit using the following setup to create a multi-platform build on a fresh Ubuntu 18.04 host:

If Docker is already installed on your host, uninstall it first.

First, download and install the test branch of Docker:
```
sudo apt-get purge docker-ce -y
curl -fsSL test.docker.com -o get-docker.sh && sh get-docker.sh
```

Add yourself to the Docker usergroup:
```
sudo usermod -aG docker $USER
```

Login to your Docker account:
```
docker login
```

Enable experimental features (buildx):
```
export DOCKER_CLI_EXPERIMENTAL=enabled && docker buildx
```

Install the instruction emulation to register ARM executables to run on x86 machines:
```
docker run --rm --privileged docker/binfmt:820fdd95a9972a5308930a2bdfb8573dd4447ad3
```

Verify handlers are setup correctly (output should show enabled):
```
cat /proc/sys/fs/binfmt_misc/qemu-aarch64
```

Create a builder instance:
```
docker buildx create --name dna-builder && docker buildx use dna-builder
docker buildx inspect --bootstrap
```

Finally, build for each architecture and push to Dockerhub:
```
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t jonfairbanks/docker-node-app:buildx . --push
```

To verify that the build was successful for the specified platforms, you can run:
```
docker buildx imagetools inspect jonfairbanks/docker-node-app:buildx
```