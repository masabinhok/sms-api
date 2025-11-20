# Exception Handling Documentation

## Overview

This project uses a **standardized exception handling system** across all microservices to ensure:
- Consistent error responses
- Better debugging experience
- Clear client error messages
- Proper HTTP status codes in responses

## Architecture

### Exception Classes (for Microservices)

Located in `apps/libs/exceptions/rpc-exceptions.ts`:

- **`BadRequestException`** (400) - Invalid input or request
- **`UnauthorizedException`** (401) - Authentication required or failed
- **`ForbiddenException`** (403) - Insufficient permissions
- **`NotFoundException`** (404) - Resource not found
- **`ConflictException`** (409) - Resource already exists (e.g., duplicate email)
- **`UnprocessableEntityException`** (422) - Validation failed
- **`InternalServerErrorException`** (500) - Unexpected server error

### Global Exception Filters

#### For Microservices (RPC)
Located in `apps/libs/filters/rpc-exception.filter.ts`:

- **`RpcValidationFilter`** - Catches RpcException and formats consistently
- **`AllExceptionsFilter`** - Catches uncaught exceptions and converts to RPC format

#### For Gateway (HTTP)
Located in `apps/libs/filters/http-exception.filter.ts`:

- **`HttpExceptionFilter`** - Catches HttpException and formats for REST API
- **`AllHttpExceptionsFilter`** - Catches all uncaught exceptions with 500 status

## Usage Examples

### Basic Exception Throwing

```typescript
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from 'apps/libs/exceptions';

// Example 1: Not found
async getUser(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

// Example 2: Conflict (duplicate)
async createUser(email: string) {
  const existing = await this.prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictException('User with this email already exists');
  }
  // ... create user
}

// Example 3: Unauthorized
async login(username: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedException('Invalid credentials');
  }
  // ... return tokens
}

// Example 4: Bad request
async updateProfile(data: UpdateDto) {
  if (!data.email && !data.phone) {
    throw new BadRequestException('At least one contact method is required');
  }
  // ... update profile
}
```

### Exception with Details

```typescript
throw new ConflictException('Username already exists', {
  field: 'username',
  value: username,
  suggestion: 'Try a different username',
});
```

### Prisma Error Handling

The `handlePrismaError()` helper automatically converts Prisma errors:

```typescript
import { handlePrismaError } from 'apps/libs/exceptions';

async createStudent(data: CreateStudentDto) {
  try {
    return await this.prisma.student.create({ data });
  } catch (error) {
    // Automatically handles P2002, P2025, etc.
    if (error.code?.startsWith('P')) {
      handlePrismaError(error);
    }
    throw error;
  }
}
```

Common Prisma error codes handled:
- **P2002** → `ConflictException` (unique constraint violation)
- **P2025** → `NotFoundException` (record not found)
- **P2003** → `BadRequestException` (foreign key constraint)
- **P2014** → `BadRequestException` (required relation missing)

### Using handleServiceError Wrapper

```typescript
import { handleServiceError } from 'apps/libs/exceptions';

async complexOperation(id: string) {
  return handleServiceError(
    async () => {
      // Your business logic here
      const result = await this.performOperation(id);
      return result;
    },
    'Failed to complete operation' // Optional context
  );
}
```

## Response Format

### Microservice (RPC) Error Response

```json
{
  "status": 404,
  "message": "User not found",
  "error": "Not Found",
  "details": {
    "userId": "123"
  }
}
```

### Gateway (HTTP) Error Response

```json
{
  "statusCode": 404,
  "timestamp": "2025-11-20T10:30:00.000Z",
  "path": "/api/users/123",
  "method": "GET",
  "message": "User not found",
  "error": "Not Found",
  "details": null
}
```

## Migration Guide

### ❌ Before (Inconsistent)

```typescript
// DON'T DO THIS
throw new Error('User not found');
throw new RpcException({ status: 404, message: 'User not found' });
throw { message: 'Something went wrong' };
```

### ✅ After (Standardized)

```typescript
// DO THIS
import { NotFoundException } from 'apps/libs/exceptions';
throw new NotFoundException('User not found');
```

## Applied to All Services

The global exception filters have been applied to:

### Microservices
- ✅ Auth Service
- ✅ Email Service
- ✅ Academics Service
- ✅ Student Service
- ✅ Teacher Service
- ✅ Activity Service

### Gateway
- ✅ API Gateway (HTTP filters)

## Benefits

### 1. **Consistent Error Messages**
All errors follow the same structure, making client-side error handling predictable.

### 2. **Better Debugging**
- Errors are logged with full context
- Stack traces preserved in development
- Error details included for troubleshooting

### 3. **Type Safety**
Using TypeScript classes ensures compile-time checks for error handling.

### 4. **Automatic Prisma Handling**
Database errors are automatically converted to meaningful exceptions.

### 5. **Centralized Error Logic**
Changes to error format only need to be made in one place.

## Best Practices

1. **Always use specific exception classes** instead of generic `Error`
2. **Provide meaningful messages** that help clients understand the issue
3. **Include relevant details** without exposing sensitive information
4. **Don't catch and rethrow** unless you're adding context
5. **Let filters handle formatting** - just throw the exception

## Testing

```typescript
describe('UserService', () => {
  it('should throw NotFoundException when user not found', async () => {
    await expect(service.getUser('invalid-id')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw ConflictException for duplicate email', async () => {
    await expect(service.createUser({ email: 'taken@example.com' })).rejects.toThrow(
      ConflictException
    );
  });
});
```

## Troubleshooting

### Issue: Errors not formatted consistently
**Solution**: Ensure global filters are applied in `main.ts` of each service.

### Issue: Prisma errors not handled
**Solution**: Use `handlePrismaError()` helper or catch Prisma-specific error codes.

### Issue: Stack traces not showing
**Solution**: Check that `AllExceptionsFilter` is applied after specific filters.

## Additional Resources

- NestJS Exception Filters: https://docs.nestjs.com/exception-filters
- Microservices Exception Handling: https://docs.nestjs.com/microservices/exception-filters
- Prisma Error Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
