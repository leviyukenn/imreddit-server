export const configuration = () => {
  console.log(process.env.FRONTEND_DOMAIN);

  return {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
    REDIS_SERVER: process.env.REDIS_SERVER,
    REDIS_SERVER_PORT: parseInt(process.env.REDIS_SERVER_PORT || '6379', 10),
    REDIS_SERVER_PASSWORD: process.env.REDIS_SERVER_PASSWORD,
    FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432', 10),
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
  };
};
