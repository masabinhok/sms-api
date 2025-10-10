import { applyDecorators } from '@nestjs/common';
import { 
  ApiUnauthorizedResponse, 
  ApiForbiddenResponse, 
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dtos/response.dto';

/**
 * Common API error responses decorator
 * Applies standard error response documentation to endpoints
 */
export function ApiCommonResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request - Invalid input or validation errors',
      type: ErrorResponseDto
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Authentication required',
      type: ErrorResponseDto
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error - Something went wrong on the server',
      type: ErrorResponseDto
    })
  );
}

/**
 * Admin-only endpoint responses decorator
 * Includes common responses plus forbidden response for non-admin users
 */
export function ApiAdminResponses() {
  return applyDecorators(
    ApiCommonResponses(),
    ApiForbiddenResponse({
      description: 'Forbidden - Admin role required',
      type: ErrorResponseDto
    })
  );
}

/**
 * Protected endpoint responses decorator
 * Includes common responses for authenticated endpoints
 */
export function ApiProtectedResponses() {
  return applyDecorators(
    ApiCommonResponses()
  );
}