import { ObjectType } from '@nestjs/graphql';
import { createTypedResponse } from 'src/response/response.dto';
import { Role } from './role.entity';

@ObjectType()
export class RoleResponse extends createTypedResponse(Role, 'role') {}
