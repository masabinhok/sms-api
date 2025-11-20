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
  },
});
