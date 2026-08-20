# Repository Guidelines

## Project Structure & Module Organization

This is a Kubernetes HPA validation app: sustained request traffic should scale its deployment, and the UI must clearly identify the pod handling each request. The Express application lives in `app.js`; `index.js` starts the server and owns graceful shutdown. The auto-refreshing hostname display is in `views/index.ejs`; static assets are in `public/`; tests are in `__tests__/`. Container configuration is in `Dockerfile` and `docker-compose.yaml`; the Helm chart is under `chart/`.

## Build, Test, and Development Commands

Use Node 26 and npm 11 (see `package.json`). Install the locked dependency set with `npm ci`.

- `npm run dev` starts the app with file watching and the Node inspector on port 9229.
- `npm start` runs the production-style server locally.
- `npm run lint` checks all JavaScript with ESLint; `npm run lint:fix` applies safe fixes.
- `npm test` runs the built-in Node test suite; `npm run test:watch` reruns it during development.
- `docker compose up --build` starts the development image with source mounts.
- `helm lint chart` validates the bundled Helm chart.

## Coding Style & Naming Conventions

Use CommonJS (`require`/`module.exports`), two-space indentation, semicolons, and single quotes, matching the existing source. Keep route handlers and middleware in `app.js`; expose startup or lifecycle helpers from `index.js`. Use descriptive camelCase JavaScript names and lowercase, hyphenated Kubernetes/Helm resource names. Run ESLint before committing rather than hand-formatting around its rules.

## Testing Guidelines

Write tests with `node:test`, `node:assert/strict`, and Supertest where HTTP behavior is involved. Place files in `__tests__/` with a `.test.js` suffix, and name tests as observable outcomes (for example, `Health check should return app status`). Preserve coverage for pod hostname headers/UI output, health checks, and shutdown behavior. Run `npm run lint && npm test` before opening a pull request.

## Commit & Pull Request Guidelines

Recent history uses short, imperative subjects such as `Upgrade runtime to Node 26`, `Fix Helm chart non-root runtime`, and `Harden container runtime and CI validation`; keep that style. Keep changes focused, explain the behavioral or deployment impact in the PR description, and include screenshots for UI-visible changes. Do not commit generated dependencies, credentials, or local environment files.

## Security & Configuration

Treat `package-lock.json` as authoritative and use `npm ci`; do not bypass engine checks. Preserve the non-root production image and `tini` signal handling. HPA is disabled by default; test scaling with an explicit Helm values override and keep its CPU request/target settings meaningful.
