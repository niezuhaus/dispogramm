![fahrrad express](apps/frontend/src/assets/logo/fex-logo.png)

# dispogramm `v1.4.6`

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

### 1. Set up MongoDB

Start a MongoDB instance on the default port (27017). You can use a [Docker container](https://hub.docker.com/_/mongo):

```bash
docker run -d -p 27017:27017 mongo
```

### 2. Clone the repository

```bash
git clone git@github.com:niezuhaus/dispogramm.git
```

### 3. Start the backend

```bash
cd apps/backend
docker compose up
```

Or without Docker (requires Java 11 + Maven 3.8+):

```bash
cd apps/backend
mvn -pl backend spring-boot:run
```

The backend runs on `localhost:8081`.

### 4. Start the frontend

```bash
cd apps/frontend
npm install
npm run start
```

Access the app at `localhost:4200`.

For production, build and host the output:

```bash
cd apps/frontend
npm run build
# serve contents of apps/frontend/dist/dispogramm
```

---

## Changelog

See [apps/frontend/CHANGELOG.md](apps/frontend/CHANGELOG.md)
