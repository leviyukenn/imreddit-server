import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import redis from 'redis';

import connectRedis from 'connect-redis';

import session from 'express-session';

//merge declaration in order to add arbitrary session data 
declare module 'express-session' {
  export interface SessionData {
    [key: string]: any;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //use redis to store session
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
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
