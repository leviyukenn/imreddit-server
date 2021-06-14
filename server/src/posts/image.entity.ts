import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@ObjectType()
@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @ManyToOne(() => Post, (post) => post.images)
  post!: Post;

  @Field()
  @Column()
  path!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  caption!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  link!: string;
}
