import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { isAdmin } from 'src/guards/isAdmin';
import { Topic } from './topic.entity';
import { TopicService } from './topic.service';

@Resolver(Topic)
export class TopicResolver {
  constructor(private readonly topicService: TopicService) {}

  @Mutation((returns) => Topic)
  @UseGuards(isAdmin)
  async createTopic(
    @Args('title') title: string,
    @Context() { req }: { req: Request },
  ) {
    return this.topicService.createTopic(title, req.session.userId!);
  }

  @Query((returns) => [Topic], { name: 'topics' })
  async getTopics() {
    return this.topicService.findAll();
  }
}
