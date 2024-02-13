import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';
import {
  UserCreateDto,
  UserPatchDto,
} from '~/modules/users/dtos/user-crud.dto';
import { ServerRequest } from '~/types';
import { UsersPermissions } from '~/authorization/permissions/users.permissions';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  async getUsers(req: ServerRequest) {
    const users = [];
    if (req.auth.payload.permissions.includes(UsersPermissions.ReadUser)) {
      return await this.repository.users({});
    } else {
      const u = await this.getUserByAuthId(req.auth.payload.sub);
      if (!u) {
        throw new ForbiddenException('Self user not found');
      }
      users.push(u);
    }
    return users;
  }

  async getUser(req: ServerRequest, id: number) {
    const user = await this.getUserByAuthId(req.auth.payload.sub);
    if (user.id === id) {
      return user;
    }

    if (req.auth.payload.permissions.includes(UsersPermissions.ReadUser)) {
      return await this.getUserById(id);
    }

    throw new ForbiddenException('Permission denied');
  }

  async createUser(req: ServerRequest, userCreateDto: UserCreateDto) {
    const user = await this.getUserByAuthId(req.auth.payload.sub);
    if (user) {
      throw new ForbiddenException('User already exists');
    }
    return await this.repository.createUser({
      ...userCreateDto,
      authId: req.auth.payload.sub,
    });
  }

  async updateUser(req: ServerRequest, id: number, userPatchDto: UserPatchDto) {
    const user = await this.getUserByAuthId(req.auth.payload.sub);

    if (user.id !== id) {
      if (req.auth.payload.permissions.includes(UsersPermissions.UpdateUser)) {
        return await this.repository.updateUser({
          where: { id },
          data: userPatchDto,
        });
      }
      throw new ForbiddenException('Permission denied');
    }

    return await this.repository.updateUser({
      where: { id: user.id },
      data: userPatchDto,
    });
  }

  async deleteUser(req: ServerRequest, id: number) {
    const user = await this.getUserByAuthId(req.auth.payload.sub);

    if (user.id !== id) {
      if (req.auth.payload.permissions.includes(UsersPermissions.DeleteUser)) {
        return await this.repository.deleteUser({ id });
      }
      throw new ForbiddenException('Permission denied');
    }

    return await this.repository.deleteUser({ id: user.id });
  }

  async getUserById(id: number) {
    console.log('1id', id);
    if (!id) {
      throw new SyntaxError('Invalid user id');
    }
    const u = await this.repository.users({ where: { id }, take: 1 });
    if (u.length === 0) {
      throw new NotFoundException('User not found');
    }
    return u[0];
  }

  async getUserByAuthId(authId: string) {
    const us = await this.repository.users({ where: { authId }, take: 1 });
    return us[0];
  }
}
