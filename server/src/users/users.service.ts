import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  // async findAll(): Promise<User[]> {
  //   return this.usersRepository.find();
  // }
  async findByUserId(userId: number) {
    return this.usersRepository.findOne(userId);
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username: username });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email: email });
  }

  async findByUsernameAndEmail(
    username: string,
    email: string,
  ): Promise<User | undefined> {
    return this.usersRepository.findOne({ username, email });
  }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
