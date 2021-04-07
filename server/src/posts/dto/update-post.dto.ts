import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdatePostInput {
  @Field((type) => Int)
  id!: number;

  @Field({ nullable: true })
  title?: string;
}
