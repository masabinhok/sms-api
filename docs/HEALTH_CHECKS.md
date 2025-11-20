# Health Check Implementation

## Overview
Comprehensive health check endpoints have been implemented across all services to ensure proper readiness before receiving traffic in production environments (Kubernetes, Render, Docker Compose).

## Problem Solved
**Before**: No health check endpoints
- Services could receive traffic before Kafka connections were established
- No way to determine if services were ready
- Kubernetes/Render couldn't perform proper readiness/liveness probes
- Risk of 503 errors during deployment

**After**: Multi-level health checks
- `/health` - Comprehensive health status (memory, disk, Kafka)
- `/health/ready` - Readiness probe (checks critical dependencies)
- `/health/live` - Liveness probe (basic heartbeat)

## Health Check Endpoints

### Gateway Service (`/health/*`)

#### 1. **`GET /health`** - Comprehensive Health Check
Returns detailed health information about all system components.

**Checks:**
- Memory heap usage (< 300MB)
- Disk storage (< 90% full)
- Kafka microservice connections (all 5 services)

**Response (200 OK):**
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    },
    "kafka": {
      "status": "up",
      "auth": { "status": "up" },
      "student": { "status": "up" },
      "teacher": { "status": "up" },
      "academics": { "status": "up" },
      "activity": { "status": "up" }
    }
  },
  "error": {},
  "details": {
    "memory_heap": { "status": "up" },
    "disk": { "status": "up" },
    "kafka": { "status": "up" }
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "kafka": {
      "status": "down",
      "auth": { "status": "down", "error": "Connection timeout" }
    }
  }
}
```

#### 2. **`GET /health/ready`** - Readiness Probe
Checks if the service is ready to accept traffic (Kafka connections established).

**Use Case:** Kubernetes readiness probe, Render health check

**Response (200 OK):**
```json
{
  "status": "ok",
  "info": {
    "kafka": {
      "status": "up"
    }
  }
}
```

#### 3. **`GET /health/live`** - Liveness Probe
Simple heartbeat to check if the service is alive.

**Use Case:** Kubernetes liveness probe, Docker healthcheck

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

### Microservices (`/health`)

Each microservice (auth, student, teacher, academics, activity) exposes a simple health endpoint:

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "auth",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

## Configuration

### 1. Docker

The `Dockerfile` includes a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**Parameters:**
- `interval`: Check every 30 seconds
- `timeout`: Max 3 seconds per check
- `start-period`: Wait 40 seconds before first check
- `retries`: Mark unhealthy after 3 failed checks

### 2. Kubernetes

Example deployment configuration in `k8s-deployment.yaml`:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 40
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 30
```

**Probe Types:**
- **Liveness**: Restarts container if unhealthy
- **Readiness**: Removes from load balancer if not ready
- **Startup**: Protects slow-starting containers from premature liveness checks

### 3. Render

Updated `render.yaml` with readiness probe:

```yaml
healthCheckPath: "/health/ready"
```

### 4. Docker Compose

Add health checks to services:

```yaml
services:
  gateway:
    image: sms-gateway
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      start_period: 40s
      retries: 3
```

## Dependencies

### Package Added
```json
"@nestjs/terminus": "^10.2.3"
```

Install with:
```bash
npm install @nestjs/terminus
```

## Implementation Details

### Files Created/Modified

**Gateway:**
- `apps/gateway/src/health/health.module.ts` - Health check module
- `apps/gateway/src/health/health.controller.ts` - Health endpoints
- `apps/gateway/src/health/kafka-health.indicator.ts` - Kafka connection checker
- `apps/gateway/src/gateway.module.ts` - Added HealthModule import

**Microservices:**
- `apps/auth/src/auth.controller.ts` - Added `/health` endpoint
- `apps/student/src/student.controller.ts` - Added `/health` endpoint
- `apps/teacher/src/teacher.controller.ts` - Added `/health` endpoint
- `apps/academics/src/academics.controller.ts` - Added `/health` endpoint
- `apps/activity/src/activity.controller.ts` - Added `/health` endpoint

**Configuration:**
- `Dockerfile` - Added HEALTHCHECK instruction
- `render.yaml` - Updated healthCheckPath
- `k8s-deployment.yaml` - Kubernetes deployment example
- `package.json` - Added @nestjs/terminus dependency

## Testing Health Checks

### Local Development

```bash
# Start the services
npm run dev

# Test gateway health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/live

# Test microservice health
curl http://localhost:3001/health  # auth
curl http://localhost:3002/health  # student
curl http://localhost:3003/health  # teacher
curl http://localhost:3004/health  # academics
curl http://localhost:3005/health  # activity
```

### Docker

```bash
# Build image
docker build -t sms-gateway .

# Run container
docker run -p 3000:3000 sms-gateway

# Check health
docker ps  # Shows health status
docker inspect --format='{{json .State.Health}}' <container-id>
```

### Kubernetes

```bash
# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check pod status
kubectl get pods
kubectl describe pod <pod-name>

# View health check logs
kubectl logs <pod-name>
```

## Best Practices

### DO ✅
- Use `/health/ready` for readiness probes
- Use `/health/live` for liveness probes
- Set appropriate `initialDelaySeconds` (40s+ for Kafka connection)
- Monitor health check failures in production
- Include critical dependencies in readiness checks
- Keep liveness checks lightweight

### DON'T ❌
- Don't use the same endpoint for liveness and readiness
- Don't check external APIs in liveness probes
- Don't set `failureThreshold` too low (causes flapping)
- Don't make health checks too slow (> 3s timeout)
- Don't skip startup probes for slow services

## Monitoring

### Metrics to Track
1. Health check response times
2. Failure rates per endpoint
3. Kafka connection stability
4. Memory and disk usage trends
5. Pod restart frequency

### Alerts to Set
- Health check failures > 3 in 5 minutes
- Readiness probe failures during deployment
- Memory usage > 80%
- Disk usage > 85%
- Kafka connection drops

## Troubleshooting

### Service Not Ready
```bash
# Check gateway logs
kubectl logs -f <gateway-pod>

# Check Kafka connection status
curl http://localhost:3000/health | jq '.info.kafka'
```

### High Memory Usage
```bash
# Check memory health
curl http://localhost:3000/health | jq '.info.memory_heap'

# Adjust heap limit in deployment
NODE_OPTIONS="--max-old-space-size=512"
```

### Kafka Connection Issues
```bash
# Verify Kafka brokers are accessible
kubectl get pods -l app=kafka

# Check microservice logs
kubectl logs -f <auth-pod>
kubectl logs -f <student-pod>
```

## Benefits

1. **Zero Downtime Deployments**: Services only receive traffic when ready
2. **Automatic Recovery**: Unhealthy containers are restarted automatically
3. **Better Monitoring**: Clear visibility into service health
4. **Production Ready**: Kubernetes and cloud platform compatible
5. **Fast Detection**: Issues detected within seconds
6. **Graceful Degradation**: Services marked unavailable instead of returning errors

## Related Documentation
- `apps/libs/exceptions/LOGGING.md` - Structured logging
- `apps/libs/exceptions/README.md` - Error handling
- `Dockerfile` - Container configuration
- `render.yaml` - Render deployment
- `k8s-deployment.yaml` - Kubernetes deployment
