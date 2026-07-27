![fahrrad express](apps/frontend/src/assets/logo/fex-logo.png)

# dispogramm `v1.5.0`

A dispatch management tool for courier services.

---

## Demo

[https://cloud.niezuhaus.de/](https://cloud.niezuhaus.de)

---

## Repository Structure

```
apps/
  frontend/   Angular SPA (port 4200)
  backend/    Spring Boot API (port 8081)
```

---

## Installation

### Quick start (recommended)

The whole stack — frontend, backend, and MongoDB — is defined in a single [docker-compose.yml](docker-compose.yml) at the repo root:

```bash
git clone git@github.com:niezuhaus/dispogramm.git
cd dispogramm
docker compose up
```

Access the app at `localhost` (port 80). This is the fastest way to get dispogramm running and matches how it's deployed in production.

### Development setup

For active frontend/backend development with hot-reload, run the pieces separately instead.

#### 1. Start the backend + MongoDB

```bash
cd apps/backend
docker compose up
```

Or without Docker (requires Java 11 + Maven 3.8+), against a MongoDB instance on the default port (27017):

```bash
cd apps/backend
mvn -pl backend spring-boot:run
```

The backend runs on `localhost:8081`.

#### 2. Start the frontend

```bash
cd apps/frontend
npm install
npm run start
```

Access the app at `localhost:4200`.

---

## Changelog

See [apps/frontend/CHANGELOG.md](apps/frontend/CHANGELOG.md)
