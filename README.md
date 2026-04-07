![fahrrad express](src/assets/logo/fex-logo.png)

# dispogramm `v1.4.6`

A dispatch management tool for courier services.

---

## Demo

[https://cloud.niezuhaus.de/](https://cloud.niezuhaus.de)

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
java -jar backend-latest.jar
```

The backend runs on `localhost:8081` with default configuration.

### 4. Start the frontend

```bash
npm install
npm run start
```

Access the app at `localhost:4200`.

For production, build and host the output:

```bash
npm run build
# serve contents of /dist/dispogram
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md)
