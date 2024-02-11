import { Injectable, Logger } from '@nestjs/common';

import { freePlan, proPlan } from '~/modules/billing/billing.plan';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async getUserBillingPlan(auth0UserId: string) {
    const user = await this.userRepository.user({
      authId: auth0UserId,
    });

    if (!user) {
      return {
        ...freePlan,
        stripeCurrentPeriodEnd: new Date(),
        isPro: false,
      };
    }

    const isPro =
      (user.stripePriceId &&
        (user.stripeCurrentPeriodEnd || new Date()).getTime() + 86_400_000 >
          Date.now()) ||
      false;

    const plan = isPro ? proPlan : freePlan;
    return {
      ...plan,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      isPro,
    };
  }

  async isFreePlanLimitReached(auth0UserId: string) {
    const user = await this.userRepository.user({
      authId: auth0UserId,
    });

    const documents = await this.documentRepository.documents({
      where: {
        userId: user.id,
      },
    });

    return documents.length >= 3;
  }
}
