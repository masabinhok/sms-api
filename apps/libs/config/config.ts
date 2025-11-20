export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE,
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9094,localhost:9095,localhost:9096').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'sms-api',
    requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT || '5000', 10),
    retryAttempts: parseInt(process.env.KAFKA_RETRY_ATTEMPTS || '2', 10),
    retryDelay: parseInt(process.env.KAFKA_RETRY_DELAY || '1000', 10),
    circuitBreakerThreshold: parseInt(process.env.KAFKA_CIRCUIT_BREAKER_THRESHOLD || '5', 10),
    circuitBreakerTimeout: parseInt(process.env.KAFKA_CIRCUIT_BREAKER_TIMEOUT || '60000', 10),
  },
});
