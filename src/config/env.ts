import { get } from 'env-var';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const env = {
  smtpUser: get('SMTP_USER').required().asString(),
  smtpPassword: get('SMTP_PASSWORD').required().asString(),
  smtpPort: get('SMTP_PORT').required().asString(),
  smtpHost: get('SMTP_HOST').required().asString(),
  email: get('EMAIL').required().asString(),
  port: get('PORT').default(3333).asPortNumber(),
  hostBack: get('HOST_BACKEND').default(`http://localhost:${3333}`).asString(),
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
