import { User } from '@prisma/client';

export type BillingPlan = {
  name: string;
  description: string;
  stripePriceId: string;
};

export type UserBillingPlan = BillingPlan &
  Pick<User, 'stripeCustomerId' | 'stripeSubscriptionId'> & {
    stripeCurrentPeriodEnd: number;
    isPro: boolean;
  };

export const freePlan: BillingPlan = {
  name: 'Free',
  description:
    'The free plan is limited to 3 resumes. Upgrade to the PRO plan for unlimited resumes.',
  stripePriceId: '',
};

export const proPlan: BillingPlan = {
  name: 'PRO',
  description: 'The PRO plan has unlimited resumes.',
  stripePriceId: process.env.STRIPE_PRO_MONTHLY_PLAN_ID || '',
};
