import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentCreateDto,
  DocumentVersionPatchDto,
} from '~/modules/documents/dtos/document-crud.dto';
import { ServerRequest } from '~/types';
import { UsersPermissions } from '~/authorization/permissions/users.permissions';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { DocumentsPermissions } from '~/authorization/permissions/documents.permissions';
import { UsersService } from '~/modules/users/users.service';
import { VersionRepository } from '~/vendors/prisma/repositories/version.repository';
import { BuilderService } from '~/modules/builder/builder.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    private readonly repository: DocumentRepository,
    private readonly versionRepository: VersionRepository,
    private readonly usersService: UsersService,
    private readonly builderService: BuilderService,
  ) {}

  async getDocuments(req: ServerRequest) {
    const docs = [];
    if (req.auth.payload.permissions.includes(DocumentsPermissions.Read)) {
      return await this.repository.documents({});
    } else {
      const u = await this.usersService.getUserByAuthId(req.auth.payload.sub);
      if (!u) {
        throw new ForbiddenException('Self user not found');
      }
      const d = await this.repository.documents({ where: { userId: u.id } });
      docs.push(...d);
    }
    return docs;
  }

  async getDocument(req: ServerRequest, id: number) {
    const doc = await this.repository.document({ id });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    const user = await this.usersService.getUserByAuthId(req.auth.payload.sub);
    if (user.id === doc.userId) {
      return doc;
    }

    if (req.auth.payload.permissions.includes(UsersPermissions.ReadUser)) {
      return await this.usersService.getUserById(id);
    }

    throw new ForbiddenException('Permission denied');
  }

  async deleteDocument(req: ServerRequest, id: number) {
    const user = await this.usersService.getUserByAuthId(req.auth.payload.sub);

    if (user.id !== id) {
      if (req.auth.payload.permissions.includes(UsersPermissions.DeleteUser)) {
        return await this.repository.deleteDocument({ id });
      }
      throw new ForbiddenException('Permission denied');
    }

    return await this.repository.deleteDocument({ id: user.id });
  }

  async createDocument(
    req: ServerRequest,
    documentCreateDto: DocumentCreateDto,
  ) {
    const user = await this.usersService.getUserByAuthId(req.auth.payload.sub);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const doc = await this.repository.createDocument({
      title: documentCreateDto.title,
      description: documentCreateDto.description,
      versionId: -1,
      userId: user.id,
    });

    const { html, prompt } = await this.builderService.buildResume(
      documentCreateDto.document,
      documentCreateDto.extras,
    );

    const version = await this.versionRepository.createVersion({
      documentId: doc.id,
      prompt,
      data: html,
      version: 0,
    });

    await this.repository.updateDocument({
      where: { id: doc.id },
      data: { versionId: version.id },
    });

    return doc;
  }

  async getVersions(req: ServerRequest, id: number) {
    const doc = await this.repository.document({ id });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const user = await this.usersService.getUserByAuthId(req.auth.payload.sub);
    if (user.id !== doc.userId) {
      if (req.auth.payload.permissions.includes(DocumentsPermissions.Read)) {
        return await this.versionRepository.versions({
          where: { documentId: doc.id },
        });
      }
      throw new ForbiddenException('Permission denied');
    }

    return await this.versionRepository.versions({
      where: { documentId: id },
    });
  }

  private async getVerionedDocument(
    documentId: number,
    documentVersionPatchDto: DocumentVersionPatchDto,
  ) {
    const versions = await this.versionRepository.versions({
      where: { documentId },
    });

    if (versions.length === 0) {
      throw new NotFoundException('Version not found');
    }

    const data = await this.builderService.versionResume(
      versions,
      documentVersionPatchDto.query,
      documentVersionPatchDto.selected,
    );
    this.logger.debug('dat:', data);

    return data;
  }

  async updateVersion(
    req: ServerRequest,
    documentId: number,
    versionId: number,
    documentVersionPatchDto: DocumentVersionPatchDto,
  ) {
    const doc = await this.repository.document({ id: documentId });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const currentVersion = await this.versionRepository.version({
      documentId,
      id: versionId,
    });

    const user = await this.usersService.getUserByAuthId(req.auth.payload.sub);
    if (user.id !== doc.userId) {
      if (req.auth.payload.permissions.includes(DocumentsPermissions.Update)) {
        const data = await this.getVerionedDocument(
          doc.id,
          documentVersionPatchDto,
        );

        const newVersion = await this.versionRepository.createVersion({
          data,
          documentId: doc.id,
          version: currentVersion.version + 1,
          prompt: documentVersionPatchDto.query,
        });

        await this.repository.updateDocument({
          where: { id: doc.id },
          data: { versionId: newVersion.id },
        });

        return newVersion;
      }

      throw new ForbiddenException('Permission denied');
    }

    const data = await this.getVerionedDocument(
      doc.id,
      documentVersionPatchDto,
    );

    const newVersion = await this.versionRepository.createVersion({
      data,
      documentId: doc.id,
      version: currentVersion.version + 1,
      prompt: documentVersionPatchDto.query,
    });

    await this.repository.updateDocument({
      where: { id: doc.id },
      data: { versionId: newVersion.id },
    });

    return newVersion;
  }

  async _getVersionByVersionNumber(documentId: number, version: number) {
    const v = await this.versionRepository.versions({
      where: { documentId, version },
    });
    if (v.length === 0) {
      throw new NotFoundException('Version not found');
    }
    return v[0];
  }
}
