import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/vendors/prisma/prisma.service';
import { Auth0User, Prisma } from '@prisma/client';

@Injectable()
export class Auth0UserRepository {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.Auth0UserWhereUniqueInput,
  ): Promise<Auth0User | null> {
    return this.prisma.auth0User.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.Auth0UserWhereUniqueInput;
    where?: Prisma.Auth0UserWhereInput;
    orderBy?: Prisma.Auth0UserOrderByWithAggregationInput;
  }): Promise<Auth0User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.auth0User.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.Auth0UserCreateInput): Promise<Auth0User> {
    return this.prisma.auth0User.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.Auth0UserWhereUniqueInput;
    data: Prisma.Auth0UserUpdateInput;
  }): Promise<Auth0User> {
    const { where, data } = params;
    return this.prisma.auth0User.update({
      data,
      where,
    });
  }

  async deleteUser(
    where: Prisma.Auth0UserWhereUniqueInput,
  ): Promise<Auth0User> {
    return this.prisma.auth0User.delete({
      where,
    });
  }
}
