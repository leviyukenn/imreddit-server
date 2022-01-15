import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/posts/post.entity';
import { Role } from 'src/role/role.entity';
import { Topic } from 'src/topic/topic.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Community extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => String)
  id!: string;

  @Field((type) => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field((type) => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column()
  description!: string;

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  background: string = '';

  @Field()
  @Column()
  backgroundColor: string = '#DAE0E6';

  @Field()
  @Column()
  bannerColor: string = '#33a8ff';

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  icon: string = '';

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  banner: string = '';

  @OneToMany(() => Role, (role) => role.community)
  membersRole!: Role[];

  @OneToMany(() => Post, (post) => post.community)
  posts!: Post[];

  @Field(() => [Topic])
  @ManyToMany(() => Topic)
  @JoinTable()
  topics!: Topic[];

  @Field(() => Int)
  totalMemberships!: number;
}
