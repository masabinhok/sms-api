import { 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
  RequestTimeoutException,
  GatewayTimeoutException
} from '@nestjs/common';

/**
 * Converts RPC exceptions from microservices to appropriate HTTP exceptions
 */
export function convertRpcExceptionToHttp(error: any): Error {
  // Handle timeout errors
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return new RequestTimeoutException('Service request timed out');
  }

  // Handle connection errors
  if (error?.message?.includes('ECONNREFUSED') || 
      error?.message?.includes('Connection refused') ||
      error?.message?.includes('Kafka') ||
      error?.message?.includes('not ready')) {
    return new ServiceUnavailableException('Service temporarily unavailable');
  }

  // Handle structured RPC exceptions
  if (error && typeof error === 'object' && error.status) {
    const message = error.message || 'Service error';
    
    switch (error.status) {
      case 400:
        return new BadRequestException(message);
      case 401:
        return new UnauthorizedException(message);
      case 403:
        return new ForbiddenException(message);
      case 404:
        return new NotFoundException(message);
      case 408:
        return new RequestTimeoutException(message);
      case 500:
        return new InternalServerErrorException(message);
      case 503:
        return new ServiceUnavailableException(message);
      case 504:
        return new GatewayTimeoutException(message);
      default:
        return new InternalServerErrorException(message);
    }
  }

  // Default error
  return new ServiceUnavailableException('Service temporarily unavailable');
}

/**
 * Checks if an error is a retriable error
 */
export function isRetriableError(error: any): boolean {
  if (!error) return false;
  
  const retriablePatterns = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'Connection refused',
    'timeout',
    'Kafka',
    'not ready'
  ];

  const errorMessage = error.message || String(error);
  return retriablePatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}
