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

export function createTypedResponse<T>(classRef: Type<T>): Type<IResponse<T>> {
  @ObjectType(`${classRef.name}FieldError`)
  abstract class FieldError implements IFieldError {
    @Field()
    field!: string;

    @Field()
    errorCode!: string;

    @Field()
    message!: string;
  }

  @ObjectType({ isAbstract: true })
  abstract class TypedResponse implements IResponse<T> {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field((type) => classRef, { nullable: true })
    data?: T;
  }
  return TypedResponse as Type<IResponse<T>>;
}
