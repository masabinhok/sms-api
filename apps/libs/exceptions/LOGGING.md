# Structured Logging Implementation

## Overview
This document describes the structured logging implementation that replaces direct `console.log()` and `console.error()` calls throughout the SMS API codebase.

## Problem Solved
- **Before**: 37+ instances of `console.log()` and `console.error()` scattered across services
- **Issues**: 
  - No structured logging format
  - Impossible to trace requests in production
  - No log levels or context
  - Difficult to filter and search logs
  - No consistent formatting

## Solution

### 1. NestJS Logger for Services
All microservices now use NestJS's built-in `Logger` class which provides:
- Structured log format with timestamps
- Log levels (log, error, warn, debug, verbose)
- Context-aware logging (service name)
- Stack trace capture for errors
- Environment-based log level configuration

#### Usage Example
```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async someMethod() {
    this.logger.log('Operation started');
    
    try {
      // Business logic
      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error.stack, { 
        userId: context.userId,
        operation: 'someMethod'
      });
    }
  }
}
```

### 2. SeedLogger for CLI Scripts
For seed scripts and CLI tools, a dedicated `SeedLogger` utility provides:
- Consistent formatting for CLI output
- User-friendly messages with emojis
- Structured success/error/info messages
- Indentation for nested information

#### Usage Example
```typescript
import { SeedLogger } from '../../libs/utils/seed-logger.util';

async function seed() {
  SeedLogger.log('🌱 Starting seed operation...');
  SeedLogger.section('Creating users...');
  SeedLogger.success('Created 10 users');
  SeedLogger.detail('Admin user: admin@example.com');
  SeedLogger.error('Failed to create user', error);
}
```

## Implementation Details

### Services Updated
1. **auth/src/auth.service.ts** - Authentication service logging
2. **gateway/src/auth/auth.service.ts** - Gateway auth client logging
3. **gateway/src/academics/academics.service.ts** - Academics client logging
4. **gateway/src/activity/activity.service.ts** - Activity client logging
5. **gateway/src/student/student.service.ts** - Student client logging
6. **gateway/src/teacher/teacher.service.ts** - Teacher client logging
7. **student/src/student.service.ts** - Student service logging
8. **teacher/src/teacher.service.ts** - Teacher service logging
9. **activity/src/activity.service.ts** - Activity service logging

### Scripts Updated
1. **academics/prisma/seed.ts** - Database seeding script

### Configuration Removed
1. **libs/config/swagger.config.ts** - Removed console.log from customJs

## Benefits

### Production Tracing
```typescript
// Before
console.log('User created');  // No context, no timestamp, no trace

// After
this.logger.log('User credentials created', { 
  profileId: userId, 
  role: 'STUDENT' 
});
// Output: [AuthService] User credentials created +123ms
```

### Error Tracking
```typescript
// Before
console.error('Error:', error);  // No stack trace, no context

// After
this.logger.error('Failed to create user', error.stack, { 
  profileId: payload.studentId 
});
// Output: [AuthService] Failed to create user
//         Error stack trace...
//         Context: { profileId: "abc123" }
```

### Log Levels
```typescript
// Development: All logs shown
this.logger.debug('Detailed debug info');
this.logger.log('General info');
this.logger.warn('Warning message');
this.logger.error('Error occurred');

// Production: Only warnings and errors (configurable)
```

## Configuration

### Environment Variables
```env
# Set log level in .env
LOG_LEVEL=log  # Options: error, warn, log, debug, verbose
```

### NestJS Main File
```typescript
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL 
      ? [process.env.LOG_LEVEL as any]
      : ['error', 'warn', 'log'],
  });
}
```

## Best Practices

### DO
✅ Use appropriate log levels:
- `logger.log()` - General information
- `logger.warn()` - Warning conditions
- `logger.error()` - Error conditions
- `logger.debug()` - Debug information

✅ Include context in error logs:
```typescript
this.logger.error('Operation failed', error.stack, {
  userId: user.id,
  operation: 'createProfile'
});
```

✅ Use structured data:
```typescript
this.logger.log('User logged in', { userId, role, timestamp });
```

### DON'T
❌ Don't use console.log/error directly in services
❌ Don't log sensitive information (passwords, tokens)
❌ Don't log in tight loops (use debug level or throttle)
❌ Don't use generic error messages without context

## Migration Checklist
- [x] Replace console.log with logger.log
- [x] Replace console.error with logger.error  
- [x] Add Logger instance to all services
- [x] Add context to error logs
- [x] Update seed scripts to use SeedLogger
- [x] Remove console calls from config files
- [x] Document logging standards

## Future Enhancements
1. **Log Aggregation**: Integrate with ELK stack or CloudWatch
2. **Request Tracing**: Add correlation IDs for distributed tracing
3. **Performance Metrics**: Log execution times for slow operations
4. **Alert Integration**: Send critical errors to monitoring systems
5. **Log Rotation**: Implement file-based logging with rotation

## Related Files
- `apps/libs/utils/seed-logger.util.ts` - CLI logging utility
- `apps/libs/exceptions/README.md` - Exception handling documentation
