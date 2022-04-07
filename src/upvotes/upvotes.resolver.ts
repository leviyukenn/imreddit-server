import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { UpvoteResponse, VoteInput } from './upvote.dto';
import { Upvote } from './upvote.entity';
import { UpvotesService } from './upvotes.service';

@Resolver(Upvote)
export class UpvotesResolver {
  constructor(private readonly upvotesService: UpvotesService) {}

  @Mutation((returns) => UpvoteResponse)
  @UseGuards(isAuth)
  async vote(
    @Args('voteInput') voteInput: VoteInput,
    @Context() { req }: { req: Request },
  ): Promise<UpvoteResponse> {
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

    const savedVote = await this.upvotesService.vote(
      req.session.userId!,
      voteInput.postId,
      realValue,
      points,
    );

    if (!savedVote) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0037)!,
        HttpStatus.NOT_MODIFIED,
      );
    }

    return {
      points,
      upvote: savedVote,
    };
  }

  @Query((returns) => Upvote, { nullable: true })
  @UseGuards(isAuth)
  async getUpvote(
    @Args('postId') postId: string,
    @Args('userId') userId: string,
    @Context() { req }: { req: Request },
  ) {
    if (userId != req.session.userId) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0030)!,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.upvotesService.findUpvote(userId, postId);
  }
}
