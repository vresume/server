import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingService } from '~/modules/billing/billing.service';
import { AuthorizationGuard } from '~/authorization/authorization.guard';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(AuthorizationGuard)
  @Get()
  async get(@Request() req: any) {
    return this.billingService.getUserBillingPlan(req.auth.payload.sub);
  }
}
