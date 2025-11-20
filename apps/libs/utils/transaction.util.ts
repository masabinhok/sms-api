import { PrismaClient } from '@prisma/client';

/**
 * Transaction utility for Prisma
 * Provides helper methods for managing database transactions
 */
export class TransactionHelper {
  /**
   * Executes operations within a transaction
   * Automatically rolls back on error
   * 
   * @param prisma - PrismaClient instance
   * @param callback - Async callback containing transactional operations
   * @returns Result of the transaction
   * 
   * @example
   * ```typescript
   * const result = await TransactionHelper.execute(this.prisma, async (tx) => {
   *   const user = await tx.user.create({ data: userData });
   *   const profile = await tx.profile.create({ data: { userId: user.id, ...profileData } });
   *   return { user, profile };
   * });
   * ```
   */
  static async execute<T>(
    prisma: PrismaClient,
    callback: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (tx: any) => {
      return await callback(tx as PrismaClient);
    });
  }

  /**
   * Executes operations within a transaction with timeout
   * 
   * @param prisma - PrismaClient instance
   * @param callback - Async callback containing transactional operations
   * @param timeout - Transaction timeout in milliseconds (default: 5000ms)
   * @returns Result of the transaction
   */
  static async executeWithTimeout<T>(
    prisma: PrismaClient,
    callback: (tx: PrismaClient) => Promise<T>,
    timeout: number = 5000
  ): Promise<T> {
    return await prisma.$transaction(
      async (tx: any) => {
        return await callback(tx as PrismaClient);
      },
      {
        maxWait: timeout,
        timeout: timeout,
      }
    );
  }

  /**
   * Executes operations within a transaction with retry logic
   * 
   * @param prisma - PrismaClient instance
   * @param callback - Async callback containing transactional operations
   * @param retries - Number of retry attempts (default: 3)
   * @param delayMs - Delay between retries in milliseconds (default: 100ms)
   * @returns Result of the transaction
   */
  static async executeWithRetry<T>(
    prisma: PrismaClient,
    callback: (tx: PrismaClient) => Promise<T>,
    retries: number = 3,
    delayMs: number = 100
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.execute(prisma, callback);
      } catch (error: any) {
        lastError = error;

        // Only retry on deadlock or timeout errors
        const isRetryable =
          error.code === 'P2034' || // Transaction conflict
          error.code === 'P2024' || // Timed out
          error.message?.includes('deadlock') ||
          error.message?.includes('timeout');

        if (!isRetryable || attempt === retries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }

    throw lastError || new Error('Transaction failed after retries');
  }

  /**
   * Executes multiple operations in parallel within a single transaction
   * 
   * @param prisma - PrismaClient instance
   * @param operations - Array of async operations
   * @returns Array of results
   * 
   * @example
   * ```typescript
   * const [user, profile, settings] = await TransactionHelper.executeParallel(
   *   this.prisma,
   *   [
   *     (tx) => tx.user.create({ data: userData }),
   *     (tx) => tx.profile.create({ data: profileData }),
   *     (tx) => tx.settings.create({ data: settingsData }),
   *   ]
   * );
   * ```
   */
  static async executeParallel<T extends any[]>(
    prisma: PrismaClient,
    operations: Array<(tx: PrismaClient) => Promise<any>>
  ): Promise<T> {
    return await prisma.$transaction(async (tx: any) => {
      return await Promise.all(
        operations.map((op) => op(tx as PrismaClient))
      );
    }) as T;
  }

  /**
   * Checks if an error is a Prisma transaction error
   */
  static isTransactionError(error: any): boolean {
    return (
      error.code === 'P2034' || // Transaction conflict
      error.code === 'P2024' || // Transaction timeout
      error.code === 'P2028' || // Transaction API error
      error.message?.includes('transaction') ||
      error.message?.includes('deadlock')
    );
  }

  /**
   * Executes a batch operation within a transaction
   * Useful for bulk inserts, updates, or deletes
   * 
   * @param prisma - PrismaClient instance
   * @param operations - Array of Prisma operations
   * @returns Array of results
   * 
   * @example
   * ```typescript
   * const result = await TransactionHelper.executeBatch(this.prisma, [
   *   prisma.user.create({ data: user1 }),
   *   prisma.user.create({ data: user2 }),
   *   prisma.user.create({ data: user3 }),
   * ]);
   * ```
   */
  static async executeBatch<T extends any[]>(
    prisma: PrismaClient,
    operations: Array<Promise<any>>
  ): Promise<T> {
    return await prisma.$transaction(operations) as T;
  }
}

/**
 * Decorator for automatic transaction management
 * Wraps a method in a Prisma transaction
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @Transactional()
 *   async createUserWithProfile(userData: any, profileData: any) {
 *     const user = await this.prisma.user.create({ data: userData });
 *     const profile = await this.prisma.profile.create({ 
 *       data: { ...profileData, userId: user.id } 
 *     });
 *     return { user, profile };
 *   }
 * }
 * ```
 */
export function Transactional(timeout?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const prisma = (this as any).prisma;

      if (!prisma) {
        throw new Error('Transactional decorator requires a "prisma" property');
      }

      if (timeout) {
        return await TransactionHelper.executeWithTimeout(
          prisma,
          async (tx) => {
            const originalPrisma = (this as any).prisma;
            (this as any).prisma = tx;
            try {
              return await originalMethod.apply(this, args);
            } finally {
              (this as any).prisma = originalPrisma;
            }
          },
          timeout
        );
      }

      return await TransactionHelper.execute(prisma, async (tx) => {
        const originalPrisma = (this as any).prisma;
        (this as any).prisma = tx;
        try {
          return await originalMethod.apply(this, args);
        } finally {
          (this as any).prisma = originalPrisma;
        }
      });
    };

    return descriptor;
  };
}
