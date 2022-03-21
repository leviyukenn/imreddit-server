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
export class isCreator implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly postsService: PostsService,
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
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0036)!,
        HttpStatus.FORBIDDEN,
      );
    }
    const postId = args.postId as string;

    const post = await this.postsService.findOne(postId);

    if (!post)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0025)!,
        HttpStatus.FORBIDDEN,
      );

    if (post.creator.id === req.session.userId) {
      return true;
    }

    throw new HttpException(
      responseErrorMessages.get(ResponseErrorCode.ERR0026)!,
      HttpStatus.FORBIDDEN,
    );
  }
}
