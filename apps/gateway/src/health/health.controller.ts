import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Returns the health status of the gateway service and its dependencies'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([
      // Check memory usage (heap should not exceed 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Check if disk storage is not exceeded 90%
      () => this.disk.checkStorage('disk', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness probe',
    description: 'Checks if the service is ready to accept traffic'
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  readiness() {
    // Simple readiness check - service is ready if it can respond
    return { 
      status: 'ok',
      ready: true,
      timestamp: new Date().toISOString() 
    };
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness probe',
    description: 'Checks if the service is alive (basic health check)'
  })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    // Simple liveness check - just return 200 if the service can respond
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
