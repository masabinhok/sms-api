/**
 * Exception handling utilities and custom exceptions
 * 
 * Usage:
 * - Import from '@app/libs/exceptions' in your services
 * - Use CustomRpcException classes instead of throw new Error()
 * - Use handleServiceError() wrapper for async operations
 * - Use handlePrismaError() for Prisma-specific error handling
 */

export * from './rpc-exceptions';
