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

This build can then be pulled and ran on any platform using the specified tag:
```
docker run -it -p 8080:8080 --name docker-node-app jonfairbanks/docker-node-app:buildx
```