# Stage 1: Build ứng dụng
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Tải dependencies trước để cache lại layer này
RUN mvn dependency:go-offline

COPY src ./src
# Build ra file .jar và bỏ qua test để quá trình build nhanh hơn
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy file jar từ stage 1 sang
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]