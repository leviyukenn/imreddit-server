import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(private connection: Connection) {}
}
