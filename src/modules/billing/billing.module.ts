import { Module } from '@nestjs/common';
import { BillingService } from '~/modules/billing/billing.service';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';
import { PrismaService } from '~/vendors/prisma/prisma.service';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';

@Module({
  providers: [
    BillingService,
    UserRepository,
    PrismaService,
    DocumentRepository,
  ],
  controllers: [],
})
export class BillingModule {}
