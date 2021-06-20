import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { Connection, getConnectionOptions } from 'typeorm';
import { CommunityModule } from './communities/community.module';
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
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
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
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
