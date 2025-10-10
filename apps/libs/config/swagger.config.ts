import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Base Swagger configuration for SMS API
 */
export const createSwaggerConfig = (
  title: string = 'SMS API',
  description: string = 'School Management System API',
  version: string = '1.0.0'
) => {
  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'Access token stored in HTTP-only cookie'
    })
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.sms.school', 'Production server')
    .build();
};

/**
 * Gateway-specific Swagger configuration
 */
export const gatewaySwaggerConfig = createSwaggerConfig(
  'SMS Gateway API',
  `
  Comprehensive API documentation for the School Management System Gateway.
  
  This API provides endpoints for managing authentication, students, teachers, and administrative functions.
  
  **Authentication:**
  - Uses JWT tokens with access and refresh token strategy
  - Tokens are stored in HTTP-only cookies for security
  - Role-based access control (ADMIN, TEACHER, STUDENT)
  
  **Authorization:**
  - Bearer token authentication required for protected endpoints
  - Role-based permissions enforced via guards
  
  **Error Handling:**
  - Standardized error responses with appropriate HTTP status codes
  - Validation errors include detailed field-specific messages
  
  **Microservices Architecture:**
  - Gateway service routes requests to appropriate microservices
  - Each microservice handles specific domain logic
  - Event-driven communication between services using Kafka
  `
);

/**
 * Document options for Swagger
 */
export const swaggerDocumentOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  deepScanRoutes: true,
};

/**
 * Swagger UI setup options
 */
export const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customSiteTitle: 'SMS API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .topbar-wrapper { 
      content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">🏫</text></svg>'); 
      width: 40px; 
      height: auto; 
    }
    .swagger-ui .topbar { 
      background-color: #1f2937; 
    }
    .swagger-ui .info hgroup.main .title { 
      color: #3b82f6; 
    }
    .swagger-ui .scheme-container { 
      background-color: #f8fafc; 
      border: 1px solid #e2e8f0; 
    }
  `,
  customJs: `
    console.log('SMS API Documentation loaded');
    // Add any custom JavaScript here
  `,
};

/**
 * Tags for organizing API endpoints
 */
export const API_TAGS = {
  AUTHENTICATION: 'Authentication',
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  ADMIN: 'Admin',
  GATEWAY: 'Gateway',
  HEALTH: 'Health Check',
} as const;