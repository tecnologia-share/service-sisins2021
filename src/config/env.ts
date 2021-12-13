import { get } from 'env-var';

const PORT = 3333;
export const env = {
  smtpUser: get('SMTP_USER').required(),
  smtpPassword: get('SMTP_PASSWORD').required(),
  smtpPort: get('SMTP_PORT').required(),
  smtpHost: get('SMTP_HOST').required(),
  email: get('EMAIL').required(),
  port: get('PORT').default(PORT),
  hostBack: get('HOST_BACKEND').default(`http://localhost:${PORT}`),
  hostFront: get('HOST_FRONTEND').default('http://localhost'),
};

export const auth = {
  jwtSecret: get('JWT_SECRET').required().asString(),
  jwtShareSecret: get('JWT_SHARE_SECRET').required().asString(),
  expiresInToken: '15m',
  secretRefreshToken: get('SECRET_REFRESH_TOKEN').required().asString(),
  expiresInRefreshToken: '30d',
  expiresRefreshTokenDays: 30,
};
