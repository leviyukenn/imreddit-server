import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/communities/community.entity';
import { Image } from 'src/posts/image.entity';
import { Upvote } from 'src/upvotes/upvote.entity';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => String)
  id!: string;

  @Field((type) => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field((type) => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field({ nullable: true })
  @Column({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  text!: string;

  @Field((type) => Int)
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.posts, {
    nullable: false,
    eager: true,
  })
  @JoinTable()
  creator!: User;

  @Field(() => Community)
  @ManyToOne((type) => Community, (community) => community.posts, {
    nullable: false,
    eager: true,
  })
  community!: Community;

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes!: Upvote[];

  @ManyToOne(() => Post, (post) => post.children)
  parent!: Post;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.parent)
  children!: Post[];

  @ManyToOne(() => Post, (post) => post.descendant, { nullable: true })
  ancestor!: Post;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.ancestor)
  descendant!: Post[];

  @Field(() => [Image])
  @OneToMany(() => Image, (img) => img.post, { eager: true })
  images!: Image[];
}
