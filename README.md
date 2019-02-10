# docker-node-app

![Docker+Node](https://raw.githubusercontent.com/jonfairbanks/docker-node-app/master/logo.jpg)

#### A sample Node.js app in Docker

- Final Image Size: 109MB
- Includes the latest versions of Node, NPM and Yarn
- Runs as a non-root user with PM2

To boot the container: `docker run -it -p 3000:8080 --name sample-app jonfairbanks/docker-node-app`

To use this Dockerfile with your own Node.js app, move the the `Dockerfile` to the root of your project and run `docker build -t <dockerhub_user>/<image_name> .` to build an image. Then run the newly built image as usual.

This application is also available from Dockerhub under [jonfairbanks/docker-node-app](https://hub.docker.com/r/jonfairbanks/docker-node-app)
