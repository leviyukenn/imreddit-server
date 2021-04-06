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

  findByUserName(username: string): Promise<User> {
    return this.usersRepository.findOne({ username: username });
  }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
