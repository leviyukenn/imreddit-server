import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Topic extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => String)
  id!: string;

  @Field((type) => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field((type) => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.topics)
  @JoinTable()
  creator!: User;

  // @ManyToMany(() => Community, (comunity) => comunity.topics)
  // communities!: Community[];

  @Column({ unique: true })
  @Field()
  title!: string;
}
