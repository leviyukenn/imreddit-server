import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { isAuth } from 'src/guards/isAuth';
import { Topic } from './topic.entity';
import { TopicService } from './topic.service';

@Resolver(Topic)
export class TopicResolver {
  constructor(private readonly topicService: TopicService) {}

  @Mutation((returns) => Topic)
  @UseGuards(isAuth)
  async createPost(
    @Args('title') title: string,
    @Context() { req }: { req: Request },
  ) {
    return this.topicService.createTopic(title, req.session.userId!);
  }
}
