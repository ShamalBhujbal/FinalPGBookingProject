# PG Finder Project

## Structure
- **frontend**: React Application (Vite)
- **backend-main**: Main Spring Boot Application (Auth, User Management)
- **service-razorpay**: Microservice for Razorpay Payment Integration
- **service-googlemaps**: Microservice for Google Maps Integration

## Setup Instructions

### Frontend
1. Navigate to `frontend` directory.
2. Run `npm run dev` to start the development server. (Dependencies are already installed).

### Backend Main
1. Navigate to `backend-main`.
2. Update `src/main/resources/application.properties` with your MySQL username/password and Email credentials.
3. Run the application using `mvn spring-boot:run` or your IDE.

### Microservices
1. **Razorpay Service**: Update `service-razorpay/src/main/resources/application.properties` with your Razorpay Key ID and Secret. Run on port 8081.
2. **Google Maps Service**: Update `service-googlemaps/src/main/resources/application.properties` with your Google Maps API Key. Run on port 8082.
