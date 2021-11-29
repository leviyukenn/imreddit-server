import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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

  // @ResolveField()
  // async membersRole(
  //   @Root() community: Community,
  //   @Context() { req }: { req: Request },
  // ) {
  //   const filteredMembersRole = community.membersRole.filter(
  //     (role) => role.userId === req.session.userId,
  //   );
  //   return filteredMembersRole;
  // }

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
  async getCommunities(
    @Args('userId', { nullable: true }) userId?: string,
  ): Promise<Community[]> {
    if (userId) {
      const communities = await this.communityService.findByUserId(userId);

      return communities;
    }

    return await this.communityService.findAll();
  }

  @Query((returns) => Community, { name: 'community', nullable: true })
  async getCommunity(
    @Args('communityName') communityName: string,
  ): Promise<Community | null> {
    const community = await this.communityService.findByName(communityName);

    return community || null;
  }
}
