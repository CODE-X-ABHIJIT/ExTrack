# Step 1: Use a lightweight Java runtime
FROM eclipse-temurin:17-jdk-jammy

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy the built JAR into the container
COPY target/*.jar app.jar

# Step 4: Expose Spring Boot default port
EXPOSE 8081

# Step 5: Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
