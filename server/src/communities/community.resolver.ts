import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { CommunityResponse, CreateCommunityInput } from './community.dto';
import { Community } from './community.entity';
import { CommunityService } from './community.service';

@Resolver(Community)
export class CommunityResolver {
  constructor(private readonly communityService: CommunityService) {}

  @ResolveField()
  async membersRole(
    @Root() community: Community,
    @Context() { req }: { req: Request },
  ) {
    const filteredMembersRole = community.membersRole.filter(
      (role) => role.userId === req.session.userId,
    );
    return filteredMembersRole;
  }

  @Mutation((returns) => CommunityResponse)
  @UseGuards(isAuth)
  async createCommunity(
    @Args('createCommunityInput') createCommunityInput: CreateCommunityInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Community>> {
    const community = await this.communityService.findByName(
      createCommunityInput.name,
    );

    if (community) {
      return createErrorResponse({
        field: 'input parameter: name',
        errorCode: ResponseErrorCode.ERR0003,
      });
    }

    const createdCommunity = await this.communityService.createCommunity(
      createCommunityInput,
      req.session.userId!,
    );
    if (createdCommunity) {
      return {
        data: createdCommunity,
      };
    } else {
      return createErrorResponse({
        field: 'process to create community',
        errorCode: ResponseErrorCode.ERR0004,
      });
    }
  }

  @Query((returns) => [Community], { name: 'communities' })
  @UseGuards(isAuth)
  async getCommunities(
    @Args('userId') userId: string,
    @Context() { req }: { req: Request },
  ): Promise<Community[]> {
    if (userId != req.session.userId!) {
      throw Error('invalid request to communities of user');
    }

    const communities = await this.communityService.findByUserId(
      req.session.userId!,
    );

    return communities;
  }
}
