# Exception Handling & Logging - Quick Reference

> **📖 Related Documentation**: See [LOGGING.md](./LOGGING.md) for detailed structured logging implementation

## Import

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  handlePrismaError,
  handleServiceError,
} from 'apps/libs/exceptions';

// For logging
import { Logger } from '@nestjs/common';
```

## Common Patterns

### Not Found (404)
```typescript
if (!user) {
  throw new NotFoundException('User not found');
}
```

### Conflict (409) - Duplicates
```typescript
if (existingUser) {
  throw new ConflictException('Email already exists');
}
```

### Unauthorized (401)
```typescript
if (!validCredentials) {
  throw new UnauthorizedException('Invalid credentials');
}
```

### Forbidden (403)
```typescript
if (!hasPermission) {
  throw new ForbiddenException('Insufficient permissions');
}
```

### Bad Request (400)
```typescript
if (!requiredField) {
  throw new BadRequestException('Field is required');
}
```

### With Details
```typescript
throw new ConflictException('Username taken', {
  field: 'username',
  suggestion: 'Try adding numbers'
});
```

## Prisma Errors

```typescript
try {
  await this.prisma.user.create({ data });
} catch (error) {
  if (error.code?.startsWith('P')) {
    handlePrismaError(error); // Auto-converts to proper exception
  }
  throw error;
}
```

## Async Wrapper

```typescript
return handleServiceError(
  async () => await this.complexOperation(),
  'Operation failed'
);
```

## Status Codes

| Exception | Code | Usage |
|-----------|------|-------|
| BadRequestException | 400 | Invalid input |
| UnauthorizedException | 401 | Auth required/failed |
| ForbiddenException | 403 | No permission |
| NotFoundException | 404 | Resource not found |
| ConflictException | 409 | Duplicate/conflict |
| InternalServerErrorException | 500 | Server error |

## Migration Checklist

- [ ] Replace `throw new Error()` with specific exceptions
- [ ] Replace `throw new RpcException()` with typed exceptions
- [ ] Add context/details to exceptions where helpful
- [ ] Use `handlePrismaError()` for database operations
- [ ] Test error responses in client

For complete documentation, see [EXCEPTION_HANDLING.md](./EXCEPTION_HANDLING.md)
