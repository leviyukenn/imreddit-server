import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Connection, getConnectionOptions } from 'typeorm';
import { AuthorsModule } from './authors/author.module';
import { PostsModule } from './posts/posts.module';
import { UpvotesModule } from './upvotes/upvotes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthorsModule,
    PostsModule,
    UpvotesModule,
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
    }),
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
