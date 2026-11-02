# ============================================================
# Stage 1: Build Application with Maven & Temurin JDK 21
# ============================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml first to take advantage of Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Production JRE 21 Runtime
# ============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add a non-root system user for security
RUN addgroup -S parking && adduser -S parking -G parking

# Copy jar artifact from build stage
COPY --from=builder /build/target/parking-management-backend-1.0.0.jar app.jar

# Set ownership to non-root user
RUN chown -R parking:parking /app

USER parking

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
