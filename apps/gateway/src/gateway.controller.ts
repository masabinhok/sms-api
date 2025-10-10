import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'apps/libs/dtos/response.dto';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({
    summary: 'Health check',
    description: 'Basic health check endpoint to verify the API gateway is running properly.'
  })
  @ApiResponse({
    status: 200,
    description: 'Gateway is healthy and operational',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }
}
