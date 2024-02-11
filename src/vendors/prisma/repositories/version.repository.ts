import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/vendors/prisma/prisma.service';
import { Version, Prisma } from '@prisma/client';

@Injectable()
export class VersionRepository {
  constructor(private prisma: PrismaService) {}

  async version(
    VersionWhereUniqueInput: Prisma.VersionWhereUniqueInput,
  ): Promise<Version | null> {
    return this.prisma.version.findUnique({
      where: VersionWhereUniqueInput,
    });
  }

  async versions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.VersionWhereUniqueInput;
    where?: Prisma.VersionWhereInput;
    orderBy?: Prisma.VersionOrderByWithAggregationInput;
  }): Promise<Version[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.version.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createVersion(data: Prisma.VersionCreateInput): Promise<Version> {
    return this.prisma.version.create({
      data,
    });
  }

  async updateVersion(params: {
    where: Prisma.VersionWhereUniqueInput;
    data: Prisma.VersionUpdateInput;
  }): Promise<Version> {
    const { where, data } = params;
    return this.prisma.version.update({
      data,
      where,
    });
  }

  async deleteVersion(where: Prisma.VersionWhereUniqueInput): Promise<Version> {
    return this.prisma.version.delete({
      where,
    });
  }
}
