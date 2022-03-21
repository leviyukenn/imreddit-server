import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

export interface IFieldError {
  field: string;

  errorCode: string;

  message: string;
}

export interface IResponse<T> {
  errors?: IFieldError[];

  data?: T;
}
@ObjectType()
class FieldError implements IFieldError {
  @Field()
  field!: string;

  @Field()
  errorCode!: string;

  @Field()
  message!: string;
}

export function createTypedResponse<T>(
  classRef: Type<T>,
  dataName: string,
): Type<IResponse<T>> {
  @ObjectType({ isAbstract: true })
  abstract class TypedResponse implements IResponse<T> {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field((type) => classRef, { nullable: true, name: dataName })
    data?: T;
  }
  return TypedResponse as Type<IResponse<T>>;
}
