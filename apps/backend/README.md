# Dispogramm Backend

Backend for the Dispogramm courier dispatch system built with Spring Boot and MongoDB.

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Run with Docker Compose

```bash
docker compose up
```

This starts the backend and a MongoDB instance. The API is available at `http://localhost:8081`.

### Local Development

Requirements: Java 11, Maven 3.8+, a running MongoDB instance.

```bash
mvn -pl backend spring-boot:run
```

MongoDB connection defaults to `localhost:27017`. Override via environment variables:

```bash
export SPRING_DATA_MONGODB_HOST=your-mongo-host
export SPRING_DATA_MONGODB_PORT=27017
```

## API Documentation

Swagger UI is available at `http://localhost:8081/swagger-ui.html` when the application is running.

## Project Structure

```
backend/
  src/main/java/net/fahrradexpress/backend/
    controllers/    # REST endpoints
    services/       # Business logic
    entities/       # MongoDB document models
    dtos/           # Data transfer objects
    repositories/   # MongoDB repositories
    config/         # Application configuration
```

## Configuration

Application properties are in `backend/src/main/resources/application.properties`. The server runs on port **8081** by default.
