import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
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
    //vote value is -1 => downvote
    //vote value is any value except -1 => upvote
    const isUpvote = voteInput.value !== -1;
    let realValue = isUpvote ? 1 : -1;
    let points = realValue;

    const upvote = await this.upvotesService.findUpvote(
      req.session.userId!,
      voteInput.postId,
    );

    //when the post is voted against last time
    if (upvote && upvote.value === -realValue) {
      points = realValue === 1 ? 2 : -2;
    }

    //when the vote is canceled
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

  @Query((returns) => Upvote, { nullable: true })
  @UseGuards(isAuth)
  async getUpvote(
    @Args('postId') postId: string,
    @Context() { req }: { req: Request },
  ) {
    return this.upvotesService.findUpvote(req.session.userId!, postId);
  }
}
