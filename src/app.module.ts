import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { Connection } from 'typeorm';
import { configuration } from '../config/configuration';
import { validationSchema } from '../config/envVariablesValidationSchema';
import { CommunityModule } from './communities/community.module';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './posts/posts.module';
import { RoleModule } from './role/role.module';
import { TopicModule } from './topic/topic.module';
import { UpvotesModule } from './upvotes/upvotes.module';
import { UsersModule } from './users/users.module';

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
      serveStaticOptions: {
        index: false,
      },
    }),
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      validationSchema,
    }),

    TypeOrmModule.forRootAsync({
      // useFactory: async () =>
      //   Object.assign(await getConnectionOptions(), {
      //     autoLoadEntities: true,
      //   }),
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        cors: {
          origin: configService.get('FRONTEND_DOMAIN'),
          // origin: true,
          credentials: true,
        },
        playground: true,
        uploads: false,
      }),
      inject: [ConfigService],
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
