FROM maven:3.9.9-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
COPY backend/pom.xml backend/
RUN mvn dependency:go-offline -pl backend
COPY backend/src backend/src
RUN mvn package -pl backend -DskipTests

FROM gcr.io/distroless/java11-debian11
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
