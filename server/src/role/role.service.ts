import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RoleService {
  constructor(private connection: Connection) {}

  async findByUserId(userId: string) {
    return Role.find({ userId });
  }
}
