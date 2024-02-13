import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from '~/modules/resume/resume.service';
import { ResumeCreateDraftDto } from '~/modules/resume/dtos/resume-create-draft.dto';
import { BillingService } from '~/modules/billing/billing.service';
import { AuthorizationGuard } from '~/authorization/authorization.guard';
import { BillingException } from '~/modules/billing/billing.exception';
import { ResumeVersionUpdateDto } from '~/modules/resume/dtos/resume-version-update.dto';

@ApiTags('resumes')
@ApiBearerAuth()
@Controller('resumes')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly billingService: BillingService,
  ) {}

  @UseGuards(AuthorizationGuard)
  @Get()
  async get(@Request() req: any) {
    return this.resumeService.getAllByUserAuth0Id(req.auth.payload.sub);
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id')
  async getResumeById(@Request() req: any, @Param('id') resumeId: number) {
    return this.resumeService.getResumeById(
      req.auth.payload.sub,
      req.auth.payload.permissions,
      resumeId,
    );
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id/version')
  async getVersions(@Request() req: any, @Param('id') id: string) {
    return this.resumeService.getVersions(req.auth.payload.sub, parseInt(id));
  }

  @UseGuards(AuthorizationGuard)
  @Patch(':id/version/:version')
  async updateVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() body: ResumeVersionUpdateDto,
  ) {
    return this.resumeService.updateVersion(
      req.auth.payload.sub,
      parseInt(id),
      parseInt(version),
      body,
    );
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id/version/:version')
  async getVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return this.resumeService.getVersion(
      req.auth.payload.sub,
      parseInt(id),
      parseInt(version),
    );
  }

  @UseGuards(AuthorizationGuard)
  @Post()
  @UseInterceptors(FileInterceptor('resume'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a resume draft.',
    type: ResumeCreateDraftDto,
  })
  async createDraft(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    resume: Express.Multer.File,
    @Request() req: any,
    @Body() body: ResumeCreateDraftDto,
  ) {
    const auth0UserId = req.auth.payload.sub;
    const plan = await this.billingService.getUserBillingPlan(auth0UserId);

    if (
      !plan.isPro &&
      (await this.billingService.isFreePlanLimitReached(auth0UserId))
    ) {
      throw new BillingException(`Limit reached: ${plan.description}`);
    }

    return this.resumeService.createDraft(auth0UserId, { ...body, resume });
  }
}
