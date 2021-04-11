import { Module, CacheModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { UsersModule } from './users/users.module';
import { join } from 'path';
import { AuthorsModule } from './authors/author.module';

import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
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
    }),

    UsersModule,
    AuthorsModule,
    PostsModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
