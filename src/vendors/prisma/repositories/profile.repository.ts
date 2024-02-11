import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/vendors/prisma/prisma.service';
import { Profile, Prisma } from '@prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(private prisma: PrismaService) {}

  async Profile(
    ProfileWhereUniqueInput: Prisma.ProfileWhereUniqueInput,
  ): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: ProfileWhereUniqueInput,
    });
  }

  async Profiles(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProfileWhereUniqueInput;
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithAggregationInput;
  }): Promise<Profile[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.profile.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProfile(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return this.prisma.profile.create({
      data,
    });
  }

  async updateProfile(params: {
    where: Prisma.ProfileWhereUniqueInput;
    data: Prisma.ProfileUpdateInput;
  }): Promise<Profile> {
    const { where, data } = params;
    return this.prisma.profile.update({
      data,
      where,
    });
  }

  async deleteProfile(where: Prisma.ProfileWhereUniqueInput): Promise<Profile> {
    return this.prisma.profile.delete({
      where,
    });
  }
}
