import { Module } from '@nestjs/common';
import { AuthorsResolver } from './authors.resolver';

@Module({
  providers: [AuthorsResolver],
})
export class AuthorsModule {}
