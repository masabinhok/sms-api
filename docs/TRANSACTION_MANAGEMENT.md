# Database Transaction Management

## Overview
Implemented comprehensive transaction management to prevent data inconsistency in multi-step database operations across the SMS API.

## Problem Solved

### Before (NO TRANSACTIONS)
```typescript
// ❌ Data inconsistency risk
const student = await this.prisma.student.create({ data });
// If the next line fails, student is created but no credentials
this.authClient.emit('student.created', { studentId: student.id });
// If this fails, we have orphaned data
this.activityClient.emit('activity.log', { ... });
```

**Issues:**
- No atomic operations
- Partial failures leave inconsistent data
- No rollback on errors
- Race conditions possible
- Cascading delete failures

### After (WITH TRANSACTIONS)
```typescript
// ✅ Atomic operation with rollback
await TransactionHelper.execute(this.prisma, async (tx) => {
  const student = await tx.student.create({ data });
  // All operations succeed or all fail together
  return student;
});
// Events only emitted after successful transaction
this.authClient.emit('student.created', { studentId: student.id });
```

**Benefits:**
- Atomic operations (all-or-nothing)
- Automatic rollback on error
- Data consistency guaranteed
- No orphaned records
- Safe concurrent operations

## Implementation

### 1. TransactionHelper Utility

Located in `apps/libs/utils/transaction.util.ts`

#### Basic Transaction
```typescript
import { TransactionHelper } from 'apps/libs/utils/transaction.util';

const result = await TransactionHelper.execute(this.prisma, async (tx) => {
  // All operations use 'tx' instead of 'this.prisma'
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ data: { ...profileData, userId: user.id } });
  return { user, profile };
});
```

#### Transaction with Timeout
```typescript
const result = await TransactionHelper.executeWithTimeout(
  this.prisma,
  async (tx) => {
    // Your operations here
    return await tx.user.create({ data });
  },
  5000 // 5 second timeout
);
```

#### Transaction with Retry
```typescript
const result = await TransactionHelper.executeWithRetry(
  this.prisma,
  async (tx) => {
    // Operations that might face temporary conflicts
    return await tx.account.update({ where: { id }, data });
  },
  3, // Max 3 retries
  100 // 100ms delay between retries
);
```

#### Parallel Operations in Transaction
```typescript
const [user, profile, settings] = await TransactionHelper.executeParallel(
  this.prisma,
  [
    (tx) => tx.user.create({ data: userData }),
    (tx) => tx.profile.create({ data: profileData }),
    (tx) => tx.settings.create({ data: settingsData }),
  ]
);
```

#### Batch Operations
```typescript
const results = await TransactionHelper.executeBatch(this.prisma, [
  prisma.user.create({ data: user1 }),
  prisma.user.create({ data: user2 }),
  prisma.user.create({ data: user3 }),
]);
```

### 2. Decorator Pattern

```typescript
import { Transactional } from 'apps/libs/utils/transaction.util';

class UserService {
  @Transactional() // Automatically wraps method in transaction
  async createUserWithProfile(userData: any, profileData: any) {
    const user = await this.prisma.user.create({ data: userData });
    const profile = await this.prisma.profile.create({ 
      data: { ...profileData, userId: user.id } 
    });
    return { user, profile };
  }
  
  @Transactional(10000) // With 10s timeout
  async complexOperation() {
    // Your complex operations
  }
}
```

### 3. Transaction with Events Pattern

For operations that need to emit events after successful transaction:

```typescript
import { executeTransactionWithEvents } from 'apps/libs/utils/transaction-patterns.util';

await executeTransactionWithEvents(
  this.prisma,
  async (tx) => {
    // Database operations
    const student = await tx.student.create({ data });
    return student;
  },
  (student) => [
    // Events emitted only after successful transaction
    {
      client: this.authClient,
      pattern: 'student.created',
      data: { studentId: student.id, email: student.email }
    },
    {
      client: this.activityClient,
      pattern: 'activity.log',
      data: { action: 'CREATE', entityId: student.id }
    }
  ]
);
```

### 4. Saga Pattern (for Distributed Transactions)

```typescript
import { SagaOrchestrator } from 'apps/libs/utils/transaction-patterns.util';

const saga = new SagaOrchestrator();

saga
  .addStep(
    // Step 1: Create student
    async () => {
      const student = await this.prisma.student.create({ data });
      return student;
    },
    // Compensation: Delete student if later steps fail
    async () => {
      await this.prisma.student.delete({ where: { id: studentId } });
    }
  )
  .addStep(
    // Step 2: Send email to auth service
    async () => {
      await firstValueFrom(
        this.authClient.send('create.credentials', { studentId })
      );
    },
    // Compensation: Delete credentials
    async () => {
      await firstValueFrom(
        this.authClient.send('delete.credentials', { studentId })
      );
    }
  );

// Execute saga (auto-compensates on failure)
const results = await saga.execute();
```

## Services Updated

### 1. Auth Service (`apps/auth/src/auth.service.ts`)

**Operation:** Admin Creation

**Before:**
```typescript
const newAdmin = await this.prisma.user.create({ data });
this.emailClient.emit('user.created', { ... });
```

**After:**
```typescript
const newAdmin = await TransactionHelper.execute(this.prisma, async (tx) => {
  return await tx.user.create({ data });
});
// Email sent only after successful transaction
this.emailClient.emit('user.created', { ... });
```

### 2. Student Service (`apps/student/src/student.service.ts`)

**Operation:** Student Deletion

**Before:**
```typescript
await this.prisma.student.delete({ where: { id } });
this.authClient.emit('student.deleted', { ... });
```

**After:**
```typescript
await TransactionHelper.execute(this.prisma, async (tx) => {
  await tx.student.delete({ where: { id } });
});
// Event sent only after successful transaction
this.authClient.emit('student.deleted', { ... });
```

### 3. Teacher Service (`apps/teacher/src/teacher.service.ts`)

**Operation:** Teacher Deletion

**Before:**
```typescript
await this.prisma.teacher.delete({ where: { id } });
this.authClient.emit('teacher.deleted', { ... });
```

**After:**
```typescript
await TransactionHelper.execute(this.prisma, async (tx) => {
  await tx.teacher.delete({ where: { id } });
});
this.authClient.emit('teacher.deleted', { ... });
```

### 4. Academics Service (`apps/academics/src/academics.service.ts`)

**Operation:** Assign Multiple Subjects to Class

**Before:**
```typescript
// ❌ If one fails, some subjects assigned, some not
const assignments = await Promise.all(
  subjects.map(sub => this.prisma.classSubject.create({ data }))
);
```

**After:**
```typescript
// ✅ All subjects assigned or none
const assignments = await TransactionHelper.execute(this.prisma, async (tx) => {
  return await Promise.all(
    subjects.map(sub => tx.classSubject.create({ data }))
  );
});
```

**Operation:** Class/Subject Deletion (with cascades)

**Before:**
```typescript
await this.prisma.class.delete({ where: { id } });
// If cascade fails, inconsistent state
```

**After:**
```typescript
await TransactionHelper.execute(this.prisma, async (tx) => {
  await tx.class.delete({ where: { id } });
  // Cascading deletes happen atomically
});
```

## Transaction Guidelines

### When to Use Transactions

✅ **DO use transactions for:**
- Multiple database operations that must succeed/fail together
- Creating records with relationships
- Deleting records with cascading deletes
- Updating multiple related records
- Batch operations (bulk insert/update/delete)
- Account balance updates
- Inventory management
- Any operation where partial failure is unacceptable

❌ **DON'T use transactions for:**
- Single database operations
- Read-only queries
- Operations that call external APIs (can't be rolled back)
- Long-running operations (risk of lock timeout)
- Operations that don't require atomicity

### Best Practices

1. **Keep Transactions Short**
   ```typescript
   // ✅ Good: Quick database operations only
   await TransactionHelper.execute(this.prisma, async (tx) => {
     await tx.user.create({ data });
     await tx.profile.create({ data });
   });
   
   // ❌ Bad: Including external API calls
   await TransactionHelper.execute(this.prisma, async (tx) => {
     await tx.user.create({ data });
     await fetch('https://api.example.com'); // DON'T DO THIS
   });
   ```

2. **Emit Events After Transaction**
   ```typescript
   // ✅ Events only after successful commit
   const result = await TransactionHelper.execute(this.prisma, async (tx) => {
     return await tx.user.create({ data });
   });
   this.eventEmitter.emit('user.created', result);
   ```

3. **Handle Transaction Errors**
   ```typescript
   try {
     await TransactionHelper.execute(this.prisma, async (tx) => {
       // Operations
     });
   } catch (error) {
     if (TransactionHelper.isTransactionError(error)) {
       this.logger.error('Transaction failed, rolled back', error);
     }
     throw error;
   }
   ```

4. **Use Appropriate Isolation Levels**
   ```typescript
   // For operations sensitive to concurrent updates
   await this.prisma.$transaction(
     async (tx) => {
       // Operations
     },
     {
       isolationLevel: 'Serializable', // Highest isolation
       maxWait: 5000,
       timeout: 10000,
     }
   );
   ```

## Outbox Pattern (For Event Reliability)

### Problem
Events sent after transactions aren't guaranteed to be delivered if the message broker is down.

### Solution
Store events in database within the same transaction:

1. **Create Outbox Table** (run migration):
```sql
-- migrations/create_outbox_table.sql
CREATE TABLE outbox_events (
  id TEXT PRIMARY KEY,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Store Events in Transaction**:
```typescript
await TransactionHelper.execute(this.prisma, async (tx) => {
  const student = await tx.student.create({ data });
  
  // Store event in outbox
  await tx.outboxEvent.create({
    data: {
      aggregateId: student.id,
      aggregateType: 'STUDENT',
      eventType: 'student.created',
      payload: { studentId: student.id, email: student.email },
      status: 'PENDING',
    },
  });
  
  return student;
});
```

3. **Process Outbox Events** (background job):
```typescript
// Runs every 5 seconds
setInterval(async () => {
  const events = await OutboxService.getPendingEvents(prisma);
  
  for (const event of events) {
    try {
      eventEmitter.emit(event.eventType, event.payload);
      await OutboxService.markAsProcessed(prisma, event.id);
    } catch (error) {
      await OutboxService.markAsFailed(prisma, event.id, error.message);
    }
  }
}, 5000);
```

## Error Handling

### Transaction Error Codes

| Code | Description | Action |
|------|-------------|--------|
| P2034 | Transaction conflict/deadlock | Retry |
| P2024 | Transaction timeout | Increase timeout or optimize |
| P2028 | Transaction API error | Check Prisma version |

### Retry Logic

```typescript
try {
  await TransactionHelper.executeWithRetry(
    this.prisma,
    async (tx) => {
      // Your operations
    },
    3 // Max 3 retries
  );
} catch (error) {
  this.logger.error('Transaction failed after retries', error);
  throw new InternalServerErrorException('Operation failed');
}
```

## Testing Transactions

```typescript
describe('UserService - Transactions', () => {
  it('should rollback on error', async () => {
    await expect(
      TransactionHelper.execute(prisma, async (tx) => {
        await tx.user.create({ data: validUser });
        await tx.profile.create({ data: invalidProfile }); // Throws error
      })
    ).rejects.toThrow();
    
    // Verify user was not created (rolled back)
    const user = await prisma.user.findFirst({ where: { email: validUser.email } });
    expect(user).toBeNull();
  });
  
  it('should commit on success', async () => {
    const result = await TransactionHelper.execute(prisma, async (tx) => {
      const user = await tx.user.create({ data: validUser });
      const profile = await tx.profile.create({ data: validProfile });
      return { user, profile };
    });
    
    // Verify both were created
    expect(result.user).toBeDefined();
    expect(result.profile).toBeDefined();
  });
});
```

## Performance Considerations

- **Transaction Duration**: Keep under 1 second
- **Lock Contention**: Minimize rows locked
- **Isolation Level**: Use Read Committed for most cases
- **Retry Strategy**: Use exponential backoff
- **Connection Pool**: Size based on concurrent transactions

## Related Files

- **`apps/libs/utils/transaction.util.ts`** - Main transaction utility
- **`apps/libs/utils/transaction-patterns.util.ts`** - Advanced patterns (Saga, Outbox)
- **`migrations/create_outbox_table.sql`** - Outbox pattern migration
- **`apps/libs/exceptions/README.md`** - Error handling
- **`apps/libs/exceptions/LOGGING.md`** - Logging standards

## Migration Checklist

- [x] Create transaction utilities
- [x] Update auth service (admin creation)
- [x] Update student service (deletion)
- [x] Update teacher service (deletion)
- [x] Update academics service (batch operations, cascading deletes)
- [x] Create outbox table migration
- [x] Document transaction patterns
- [ ] Implement outbox processor (background job)
- [ ] Add transaction monitoring
- [ ] Create transaction performance tests
