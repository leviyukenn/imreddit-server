import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { Community } from './community.entity';
import { CommunityService } from './community.service';
import { UseGuards } from '@nestjs/common';
import { isAuth } from 'src/guards/isAuth';
import { CreatePostInput } from 'src/posts/dto/create-post.dto';

@Resolver(Community)
export class CommunityResolver {
  constructor(private readonly communityService: CommunityService) {}

  
  @Mutation((returns) => Community)
  @UseGuards(isAuth)
  async createCommunity(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @Context() { req }: { req: Request },
  ) {


    // return this.postsService.createPost({
    //   ...createPostInput,
    //   creatorId: req.session.userId!,
    // });
  }
}
