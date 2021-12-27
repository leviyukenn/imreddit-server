import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RoleService {
  constructor(private connection: Connection) {}

  async findByUserId(userId: string) {
    return Role.find({ userId });
  }

  async findByUserIdAndCommunityId(userId: string, communityId: string) {
    return Role.findOne({ userId, communityId });
  }

  // async joinCommunity(userInput: { username: string;
  //   password: string;
  //   email: string;
  //   role: UserRole;
  // }): Promise<User> {
  //   return User.create(userInput).save();
  // }
}
