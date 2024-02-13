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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

import { AuthorizationGuard } from '~/authorization/authorization.guard';
import { DocumentsService } from '~/modules/documents/documents.service';
import {
  DocumentCreateDto,
  DocumentVersionPatchDto,
} from '~/modules/documents/dtos/document-crud.dto';
import { ServerRequest } from '~/types';
import { version } from 'os';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(AuthorizationGuard)
  @Get()
  async getDocuments(@Req() req: ServerRequest): Promise<User[]> {
    return await this.documentsService.getDocuments(req);
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id')
  async getDocument(@Req() req: ServerRequest, @Param('id') id: number) {
    try {
      return await this.documentsService.getDocument(req, +id);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  async deleteDocument(@Req() req: ServerRequest, @Param('id') id: number) {
    try {
      return await this.documentsService.deleteDocument(req, +id);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Post()
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DocumentCreateDto })
  async createUser(
    @Req() req: ServerRequest,
    @Body() documentCreateDto: DocumentCreateDto,
  ) {
    try {
      return await this.documentsService.createDocument(req, documentCreateDto);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id/versions')
  async getVersions(@Req() req: ServerRequest, @Param('id') id: string) {
    try {
      return await this.documentsService.getVersions(req, +id);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Patch(':id/versions/:version')
  @ApiBody({ type: DocumentVersionPatchDto })
  async updateVersion(
    @Req() req: ServerRequest,
    @Param('id') id: number,
    @Param('version') v: number,
    @Body() documentVersionPatchDto: DocumentVersionPatchDto,
  ) {
    try {
      const version = await this.documentsService._getVersionByVersionNumber(
        +id,
        +v,
      );
      return await this.documentsService.updateVersion(
        req,
        +id,
        version.id,
        documentVersionPatchDto,
      );
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }
}
