# Exception Handling Architecture

## Exception Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  HTTP Exception Filters                                 │    │
│  │  - HttpExceptionFilter                                  │    │
│  │  - AllHttpExceptionsFilter                             │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Kafka RPC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES                               │
│  ┌───────────┬───────────┬───────────┬───────────┬──────────┐  │
│  │   Auth    │  Student  │  Teacher  │ Academics │ Activity │  │
│  │           │           │           │           │          │  │
│  │  Service  │  Service  │  Service  │  Service  │ Service  │  │
│  │  Layer    │  Layer    │  Layer    │  Layer    │  Layer   │  │
│  └─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┴────┬─────┘  │
│        │           │           │           │          │         │
│        ▼           ▼           ▼           ▼          ▼         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Exception Classes (apps/libs/exceptions)                │  │
│  │  - BadRequestException                                   │  │
│  │  - UnauthorizedException                                 │  │
│  │  - ForbiddenException                                    │  │
│  │  - NotFoundException                                     │  │
│  │  - ConflictException                                     │  │
│  │  - InternalServerErrorException                          │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RPC Exception Filters                                   │  │
│  │  - RpcValidationFilter                                   │  │
│  │  - AllExceptionsFilter                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FORMATTED ERROR RESPONSE                      │
│  {                                                               │
│    "statusCode": 404,                                           │
│    "timestamp": "2025-11-20T10:30:00.000Z",                    │
│    "path": "/api/users/123",                                   │
│    "method": "GET",                                            │
│    "message": "User not found",                                │
│    "error": "Not Found",                                       │
│    "details": null                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. Exception Classes
**Location**: `apps/libs/exceptions/rpc-exceptions.ts`

**Purpose**: Standardized exception types with HTTP status codes

**Usage**:
```typescript
throw new NotFoundException('Resource not found');
throw new ConflictException('Already exists');
```

### 2. RPC Exception Filters (Microservices)
**Location**: `apps/libs/filters/rpc-exception.filter.ts`

**Purpose**: 
- Catch all RPC exceptions
- Format consistently
- Log errors
- Convert uncaught exceptions

**Applied to**:
- Auth, Email, Student, Teacher, Academics, Activity services

### 3. HTTP Exception Filters (Gateway)
**Location**: `apps/libs/filters/http-exception.filter.ts`

**Purpose**:
- Catch HTTP exceptions
- Format for REST API
- Add timestamp and path info
- Handle uncaught exceptions with 500 status

**Applied to**:
- API Gateway

## Exception Handling Strategies

### Strategy 1: Direct Throw
```typescript
if (!user) {
  throw new NotFoundException('User not found');
}
```

### Strategy 2: Prisma Error Handler
```typescript
try {
  await this.prisma.user.create({ data });
} catch (error) {
  if (error.code?.startsWith('P')) {
    handlePrismaError(error); // Auto-converts
  }
  throw error;
}
```

### Strategy 3: Service Error Wrapper
```typescript
return handleServiceError(
  async () => await this.complexOperation(),
  'Operation failed'
);
```

## Error Propagation

```
Service Method
    │
    ├─ Business Logic Error
    │  └─> throw new NotFoundException()
    │
    ├─ Database Error (Prisma)
    │  └─> handlePrismaError()
    │      └─> throw new ConflictException()
    │
    └─ Unexpected Error
       └─> throw new InternalServerErrorException()
           │
           ▼
    Global Exception Filter
           │
           ├─ Format Error
           ├─ Log Error
           ├─ Add Metadata
           │
           ▼
    Standardized Response
           │
           ▼
    Client receives consistent error format
```

## Status Code Mapping

| Exception | HTTP Status | RPC Status | Common Scenarios |
|-----------|-------------|------------|------------------|
| BadRequestException | 400 | 400 | Invalid input, missing required fields |
| UnauthorizedException | 401 | 401 | Invalid credentials, expired token |
| ForbiddenException | 403 | 403 | Insufficient permissions |
| NotFoundException | 404 | 404 | Resource doesn't exist |
| ConflictException | 409 | 409 | Duplicate email, username taken |
| UnprocessableEntityException | 422 | 422 | Validation failed |
| InternalServerErrorException | 500 | 500 | Unexpected errors |

## Prisma Error Mapping

| Prisma Code | Exception | Message |
|-------------|-----------|---------|
| P2002 | ConflictException | Unique constraint violation |
| P2025 | NotFoundException | Record not found |
| P2003 | BadRequestException | Foreign key constraint |
| P2014 | BadRequestException | Required relation missing |
| P* | InternalServerErrorException | Generic database error |

## Benefits Visualization

```
Before                          After
─────────────────              ─────────────────────────
┌──────────────┐               ┌────────────────────┐
│ throw Error  │               │ NotFoundException  │
│ (generic)    │               │ (typed)            │
└──────────────┘               └────────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐               ┌────────────────────┐
│ Inconsistent │               │ Global Filter      │
│ handling     │               │ (automatic)        │
└──────────────┘               └────────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐               ┌────────────────────┐
│ Poor client  │               │ Standardized       │
│ messages     │               │ response format    │
└──────────────┘               └────────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐               ┌────────────────────┐
│ Hard to      │               │ Easy debugging     │
│ debug        │               │ Clear messages     │
└──────────────┘               └────────────────────┘
```

## Integration Points

### Microservice to Microservice
```
Auth Service                Student Service
    │                           │
    └─> emit('student.created') │
            │                   │
            └──────────────────>│ validates
                               │ throws NotFoundException
                               │
                               ▼
                        RPC Filter catches
                               │
                               ▼
                        Formatted error to Auth
```

### Gateway to Microservice
```
Client → Gateway → Microservice
                       │
                   throws ConflictException
                       │
                       ▼
                  RPC Filter formats
                       │
                       ▼
Gateway ← RPC Error Response
   │
   ▼
HTTP Filter reformats for REST
   │
   ▼
Client ← HTTP Error Response
```

This architecture ensures **end-to-end consistency** in error handling across the entire microservices ecosystem.
