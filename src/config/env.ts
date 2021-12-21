import { get } from 'env-var';

const PORT = 3333;
export const env = {
  smtpUser: get('SMTP_USER').required().asString(),
  smtpPassword: get('SMTP_PASSWORD').required().asString(),
  smtpPort: get('SMTP_PORT').required().asString(),
  smtpHost: get('SMTP_HOST').required().asString(),
  email: get('EMAIL').required().asString(),
  port: get('PORT').default(PORT).asPortNumber(),
  hostBack: get('HOST_BACKEND').default(`http://localhost:${PORT}`).asString(),
  hostFront: get('HOST_FRONTEND').default('http://localhost').asString(),
};

export const auth = {
  jwtSecret: get('JWT_SECRET').required().asString(),
  jwtShareSecret: get('JWT_SHARE_SECRET').required().asString(),
  expiresInToken: '15m',
  secretRefreshToken: get('SECRET_REFRESH_TOKEN').required().asString(),
  expiresInRefreshToken: '30d',
  expiresRefreshTokenDays: 30,
};
