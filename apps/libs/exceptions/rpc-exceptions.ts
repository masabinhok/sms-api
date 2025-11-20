import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

/**
 * Base interface for RPC exception payload
 */
export interface RpcExceptionPayload {
  status: number;
  message: string;
  error?: string;
  details?: any;
}

/**
 * Custom RPC Exception classes for consistent error handling
 */
export class CustomRpcException extends RpcException {
  constructor(payload: RpcExceptionPayload) {
    super(payload);
  }
}

export class BadRequestException extends CustomRpcException {
  constructor(message: string, details?: any) {
    super({
      status: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
      details,
    });
  }
}

export class UnauthorizedException extends CustomRpcException {
  constructor(message: string = 'Unauthorized', details?: any) {
    super({
      status: HttpStatus.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
      details,
    });
  }
}

export class ForbiddenException extends CustomRpcException {
  constructor(message: string = 'Forbidden', details?: any) {
    super({
      status: HttpStatus.FORBIDDEN,
      message,
      error: 'Forbidden',
      details,
    });
  }
}

export class NotFoundException extends CustomRpcException {
  constructor(message: string, details?: any) {
    super({
      status: HttpStatus.NOT_FOUND,
      message,
      error: 'Not Found',
      details,
    });
  }
}

export class ConflictException extends CustomRpcException {
  constructor(message: string, details?: any) {
    super({
      status: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
      details,
    });
  }
}

export class InternalServerErrorException extends CustomRpcException {
  constructor(message: string = 'Internal server error', details?: any) {
    super({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'Internal Server Error',
      details,
    });
  }
}

export class UnprocessableEntityException extends CustomRpcException {
  constructor(message: string, details?: any) {
    super({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      message,
      error: 'Unprocessable Entity',
      details,
    });
  }
}

/**
 * Helper function to handle Prisma errors and convert them to RPC exceptions
 */
export function handlePrismaError(error: any): never {
  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'field';
    throw new ConflictException(`A record with this ${field} already exists`, {
      code: error.code,
      field,
    });
  }

  if (error.code === 'P2025') {
    // Record not found
    throw new NotFoundException('Record not found', {
      code: error.code,
    });
  }

  if (error.code === 'P2003') {
    // Foreign key constraint violation
    throw new BadRequestException('Invalid reference to related record', {
      code: error.code,
    });
  }

  if (error.code === 'P2014') {
    // Required relation violation
    throw new BadRequestException('Required relation is missing', {
      code: error.code,
    });
  }

  // Generic Prisma error
  if (error.code?.startsWith('P')) {
    throw new InternalServerErrorException('Database operation failed', {
      code: error.code,
    });
  }

  // Generic error
  throw new InternalServerErrorException(
    error.message || 'An unexpected error occurred',
    {
      originalError: error.name,
    }
  );
}

/**
 * Helper function to wrap async operations with error handling
 */
export async function handleServiceError<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // If it's already an RpcException, rethrow it
    if (error instanceof CustomRpcException || error instanceof RpcException) {
      throw error;
    }

    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      handlePrismaError(error);
    }

    // Handle generic errors
    throw new InternalServerErrorException(
      errorContext
        ? `${errorContext}: ${error.message}`
        : error.message || 'Operation failed',
      {
        originalError: error.name,
      }
    );
  }
}
