import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor() {}

  async createUser(userInput: {
    username: string;
    password: string;
    email: string;
  }): Promise<User> {
    return User.create(userInput).save();
  }

  async findByUserId(userId: string) {
    return User.findOne(userId);
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return User.findOne({ username: username });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ email: email });
  }

  async findByUsernameAndEmail(
    username: string,
    email: string,
  ): Promise<User | undefined> {
    return User.findOne({ username, email });
  }

  async updateUserPassword(userId: string, password: string) {
    return User.update(userId, { password });
  }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
