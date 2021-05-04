import { ObjectType } from '@nestjs/graphql';
import { Post } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  postId!: string;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Post;

  @ManyToOne(() => User, (user) => user.upvotes)
  user!: User;

  @Column({ type: 'int' })
  value!: number;
}
