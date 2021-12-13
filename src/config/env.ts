const PORT = 3333;
export const env = {
  typeormConnection: process.env.TYPEORM_CONNECTION,
  typeormDatabase: process.env.TYPEORM_DATABASE,
  typeormMigrations: process.env.TYPEORM_MIGRATIONS,
  typeormMigrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
  typeormEntities: process.env.TYPEORM_ENTITIES,
  jwtShareSecret: process.env.JWT_SHARE_SECRET,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpPort: process.env.SMTP_PORT,
  smtpHost: process.env.SMTP_HOST,
  email: process.env.EMAIL,
  port: process.env.PORT || PORT,
  hostBack: process.env.HOST_BACKEND || `http://localhost:${PORT}`,
  hostFront: process.env.HOST_FRONTEND || 'http://localhost',
};

export const auth = {
  jwtSecret: process.env.JWT_SECRET,
  expiresInToken: '15m',
  secretRefreshToken: process.env.SECRET_REFRESH_TOKEN,
  expiresInRefreshToken: '30d',
  expiresRefreshTokenDays: 30,
};
