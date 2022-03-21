import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { PostsService } from 'src/posts/posts.service';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class isPostModerator implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly postService: PostsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();
    if (!req.session.userId) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0030)!,
        HttpStatus.FORBIDDEN,
      );
    }
    const args = GqlExecutionContext.create(context).getArgs();
    if (!(args?.postId && typeof args.postId === 'string')) {
      return false;
    }
    const postId = args.postId as string;

    const post = await this.postService.findByUserIdWithRemovedPost(postId);
    if (!post?.community.id) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0025)!,
        HttpStatus.FORBIDDEN,
      );
    }

    const role = await this.roleService.findByUserIdAndCommunityId(
      req.session.userId,
      post.community.id,
    );

    if (role?.isModerator) {
      return true;
    }
    throw new HttpException(
      responseErrorMessages.get(ResponseErrorCode.ERR0033)!,
      HttpStatus.FORBIDDEN,
    );
  }
}
