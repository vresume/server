import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepositoy: UserRepository) {}

  async getUserById(id: number) {
    return await this.userRepositoy.user({ id });
  }

  async getUserByAuthId(authId: string) {
    return await this.userRepositoy.user({ authId });
  }

  async getUsersByAuthId(authId: string) {
    return await this.userRepositoy.users({ where: { authId } });
  }

  async getUsers() {
    return await this.userRepositoy.users({});
  }

  async getOrOnboardUser(credentials: any) {
    try {
      const user = await this.userRepositoy.user({
        authId: credentials.payload.subd,
      });

      if (user) {
        this.logger.debug(`User found with auth0Id: ${user.authId}`);
        return user;
      }

      this.logger.debug(`User not found, starting onboarding account...`);
      return await this.userRepositoy.createUser({
        authId: credentials.payload.sub,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
