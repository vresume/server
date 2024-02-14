import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Post,
  Body,
  Logger,
  Delete,
  UseInterceptors,
  Patch,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthorizationGuard } from '~/authorization/authorization.guard';
import { ServerRequest } from '~/types';

import { BuilderService } from '~/modules/builder/builder.service';
import { DraftCreateDto } from '~/modules/builder/dtos/draft-create.dto';

@ApiTags('marketing')
@Controller('marketing')
export class BuilderController {
  private readonly logger = new Logger(BuilderController.name);

  constructor(private readonly builderService: BuilderService) {}

  @UseGuards(AuthorizationGuard)
  @Post('resume')
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DraftCreateDto })
  async createUser(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    document: Express.Multer.File,
    @Req() req: ServerRequest,
    @Body() draftCreateDto: DraftCreateDto,
  ) {
    try {
      return await this.builderService.buildResume(
        document,
        draftCreateDto.extras,
      );
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }
}
