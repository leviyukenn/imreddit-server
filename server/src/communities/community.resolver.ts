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
import { isModerator } from 'src/guards/isModerator';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { InputParameterValidator } from 'src/util/validators';
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

  @ResolveField()
  async totalMemberships(@Root() community: Community) {
    const totalMemberships = await this.communityService.countMemberships(
      community.id,
    );
    return totalMemberships;
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
        field: 'name',
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

  @Mutation((returns) => CommunityResponse)
  @UseGuards(isModerator)
  async editCommunityDescription(
    @Args('communityId') communityId: string,
    @Args('description') description: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Community>> {
    const validator = InputParameterValidator.object().validateCommunityDescription(
      description,
    );
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const updatedRows = await this.communityService.editCommunityDescription(
      communityId,
      description,
    );
    if (!updatedRows) {
      return createErrorResponse({
        field: 'description',
        errorCode: ResponseErrorCode.ERR0019,
      });
    }

    const community = await this.communityService.findById(communityId);
    if (!community) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0014,
      });
    }

    return { data: community };
  }

  @Mutation((returns) => CommunityResponse)
  @UseGuards(isModerator)
  async setCommunityImages(
    @Args('communityId') communityId: string,
    @Args('background', { nullable: true }) background?: string,
    @Args('icon', { nullable: true }) icon?: string,
    @Args('banner', { nullable: true }) banner?: string,
  ): Promise<IResponse<Community>> {
    if (!(background || icon || banner)) {
      return createErrorResponse({
        field: 'images',
        errorCode: ResponseErrorCode.ERR0019,
      });
    }

    const updatedRows = await this.communityService.setCommunityImages(
      communityId,
      { background, icon, banner },
    );
    if (!updatedRows) {
      return createErrorResponse({
        field: 'images',
        errorCode: ResponseErrorCode.ERR0019,
      });
    }

    const community = await this.communityService.findById(communityId);
    if (!community) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0014,
      });
    }
    return { data: community };
  }
}
