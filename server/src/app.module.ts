import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { graphqlUploadExpress } from 'graphql-upload';
import Joi from 'joi';
import { join } from 'path';
import { Connection, getConnectionOptions } from 'typeorm';
import { CommunityModule } from './communities/community.module';
import { PostsModule } from './posts/posts.module';
import { RoleModule } from './role/role.module';
import { TopicModule } from './topic/topic.module';
import { UpvotesModule } from './upvotes/upvotes.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    UpvotesModule,
    RoleModule,
    CommunityModule,
    TopicModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
        // ...
      }),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      cors: {
        origin: 'http://localhost:3005',
        credentials: true,
      },
      playground: true,
      uploads: false,
    }),
    MailModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
