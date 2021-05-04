import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { isAuth } from 'src/guards/isAuth';
import { VoteInput } from './upvote.dto';
import { Upvote } from './upvote.entity';
import { UpvotesService } from './upvotes.service';

@Resolver(Upvote)
export class UpvotesResolver {
  constructor(private readonly upvotesService: UpvotesService) {}

  @Mutation((returns) => Int)
  @UseGuards(isAuth)
  async vote(
    @Args('voteInput') voteInput: VoteInput,
    @Context() { req }: { req: Request },
  ) {
    const isUpvote = voteInput.value !== -1;
    let realValue = isUpvote ? 1 : -1;
    let points = realValue;

    const upvote = await this.upvotesService.findUpvote(
      req.session.userId!,
      voteInput.postId,
    );

    if (upvote && upvote.value === -realValue) {
      points = realValue === 1 ? 2 : -2;
    }

    if (upvote && upvote.value === realValue) {
      points = realValue === 1 ? -1 : 1;
      realValue = 0;
    }

    return this.upvotesService.vote(
      req.session.userId!,
      voteInput.postId,
      realValue,
      points,
    );
  }
}
