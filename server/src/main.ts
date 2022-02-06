import { NestFactory } from '@nestjs/core';
import connectRedis from 'connect-redis';
import session from 'express-session';
import redis from 'redis';
import { AppModule } from './app.module';
import { COOKIE_NAME } from './constant/constant';

//merge declaration in order to add arbitrary session data
declare module 'express-session' {
  export interface SessionData {
    userId?: string;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //use redis to store session
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  // app.useStaticAssets(join(__dirname, '..', 'public'), {
  //   index: false,
  //   prefix: '/public',
  // });
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, //1 day
        httpOnly: true,
      },
      saveUninitialized: false,
      secret: 'fhiawHfiawhfiuaghw',
      resave: false,
    }),
  );

  await app.listen(3000);
}
bootstrap();
