# Multi-stage build for Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -f backend/pom.xml -q -DskipTests dependency:go-offline
COPY backend backend
RUN --mount=type=cache,target=/root/.m2 mvn -f backend/pom.xml -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /opt/app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/opt/app/app.jar"]


