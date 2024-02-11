import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/vendors/prisma/prisma.service';
import { Posting, Prisma } from '@prisma/client';

@Injectable()
export class PostingRepository {
  constructor(private prisma: PrismaService) {}

  async posting(
    PostingWhereUniqueInput: Prisma.PostingWhereUniqueInput,
  ): Promise<Posting | null> {
    return this.prisma.posting.findUnique({
      where: PostingWhereUniqueInput,
    });
  }

  async postings(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostingWhereUniqueInput;
    where?: Prisma.PostingWhereInput;
    orderBy?: Prisma.PostingOrderByWithAggregationInput;
  }): Promise<Posting[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.posting.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPosting(data: Prisma.PostingCreateInput): Promise<Posting> {
    return this.prisma.posting.create({
      data,
    });
  }

  async updatePosting(params: {
    where: Prisma.PostingWhereUniqueInput;
    data: Prisma.PostingUpdateInput;
  }): Promise<Posting> {
    const { where, data } = params;
    return this.prisma.posting.update({
      data,
      where,
    });
  }

  async deletePosting(where: Prisma.PostingWhereUniqueInput): Promise<Posting> {
    return this.prisma.posting.delete({
      where,
    });
  }
}
