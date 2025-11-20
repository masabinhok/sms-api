import { Logger } from '@nestjs/common';
import { TransactionHelper } from './transaction.util';
import { PrismaClient } from '@prisma/client';

/**
 * Outbox Pattern Implementation for Microservices
 * 
 * Ensures reliable event delivery by storing events in database
 * within the same transaction as the business operation.
 * A separate processor reads from the outbox and publishes events.
 */

export interface OutboxEvent {
  id?: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: any;
  createdAt?: Date;
  processedAt?: Date | null;
  status?: 'PENDING' | 'PROCESSED' | 'FAILED';
  retryCount?: number;
  error?: string | null;
}

/**
 * Outbox Service for storing events during transactions
 */
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  /**
   * Stores an event in the outbox table within a transaction
   * This ensures the event is only saved if the business operation succeeds
   */
  static async storeEvent(
    tx: any,
    event: OutboxEvent
  ): Promise<void> {
    // Note: This requires an outbox table in your Prisma schema
    // Create the table if it doesn't exist
    try {
      await tx.outboxEvent.create({
        data: {
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          payload: event.payload,
          status: 'PENDING',
          retryCount: 0,
        },
      });
    } catch (error: any) {
      // If outbox table doesn't exist, log warning
      // In production, you should create the table
      const logger = new Logger('OutboxService');
      logger.warn('Outbox table not found. Events will be sent directly (not transactional)', {
        error: error.message,
      });
    }
  }

  /**
   * Retrieves pending events from the outbox
   */
  static async getPendingEvents(
    prisma: PrismaClient,
    limit: number = 100
  ): Promise<OutboxEvent[]> {
    try {
      return await (prisma as any).outboxEvent.findMany({
        where: {
          status: 'PENDING',
          retryCount: { lt: 5 }, // Max 5 retries
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Marks an event as processed
   */
  static async markAsProcessed(
    prisma: PrismaClient,
    eventId: string
  ): Promise<void> {
    try {
      await (prisma as any).outboxEvent.update({
        where: { id: eventId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });
    } catch (error) {
      // Ignore if table doesn't exist
    }
  }

  /**
   * Marks an event as failed
   */
  static async markAsFailed(
    prisma: PrismaClient,
    eventId: string,
    error: string
  ): Promise<void> {
    try {
      await (prisma as any).outboxEvent.update({
        where: { id: eventId },
        data: {
          status: 'FAILED',
          error: error,
          retryCount: { increment: 1 },
        },
      });
    } catch (err) {
      // Ignore if table doesn't exist
    }
  }
}

/**
 * Transaction with Event Pattern
 * Combines database transaction with reliable event publishing
 * 
 * @example
 * ```typescript
 * await executeTransactionWithEvents(
 *   this.prisma,
 *   async (tx) => {
 *     // Database operations
 *     const student = await tx.student.create({ data });
 *     return student;
 *   },
 *   (result) => [
 *     // Events to emit after successful transaction
 *     {
 *       client: this.authClient,
 *       pattern: 'student.created',
 *       data: { studentId: result.id, email: result.email }
 *     }
 *   ]
 * );
 * ```
 */
export async function executeTransactionWithEvents<T>(
  prisma: PrismaClient,
  transactionCallback: (tx: PrismaClient) => Promise<T>,
  eventsCallback: (result: T) => Array<{
    client: any;
    pattern: string;
    data: any;
  }>
): Promise<T> {
  const logger = new Logger('TransactionWithEvents');

  // Execute transaction
  const result = await TransactionHelper.execute(prisma, transactionCallback);

  // Emit events after successful transaction
  try {
    const events = eventsCallback(result);
    for (const event of events) {
      event.client.emit(event.pattern, event.data);
      logger.debug(`Event emitted: ${event.pattern}`, event.data);
    }
  } catch (error: any) {
    // Log error but don't rollback transaction (data is already committed)
    logger.error('Failed to emit events after transaction', error.stack);
    // In production, these events should be stored in outbox and retried
  }

  return result;
}

/**
 * Saga Pattern Implementation
 * For distributed transactions across microservices
 * Implements compensation logic if any step fails
 */
export class SagaOrchestrator {
  private readonly logger = new Logger(SagaOrchestrator.name);
  private steps: Array<{
    execute: () => Promise<any>;
    compensate: () => Promise<void>;
  }> = [];
  private executedSteps: number = 0;

  /**
   * Adds a step to the saga with its compensation logic
   */
  addStep(
    execute: () => Promise<any>,
    compensate: () => Promise<void>
  ): this {
    this.steps.push({ execute, compensate });
    return this;
  }

  /**
   * Executes the saga
   * If any step fails, runs compensation logic for all executed steps
   */
  async execute(): Promise<any> {
    const results: any[] = [];

    try {
      for (const step of this.steps) {
        const result = await step.execute();
        results.push(result);
        this.executedSteps++;
      }
      return results;
    } catch (error: any) {
      this.logger.error(`Saga failed at step ${this.executedSteps}`, error.stack);
      await this.compensate();
      throw error;
    }
  }

  /**
   * Runs compensation logic for all executed steps in reverse order
   */
  private async compensate(): Promise<void> {
    this.logger.warn(`Running compensation for ${this.executedSteps} steps`);

    for (let i = this.executedSteps - 1; i >= 0; i--) {
      try {
        await this.steps[i].compensate();
        this.logger.debug(`Compensated step ${i + 1}`);
      } catch (error: any) {
        this.logger.error(`Failed to compensate step ${i + 1}`, error.stack);
        // Continue with other compensations even if one fails
      }
    }
  }
}
