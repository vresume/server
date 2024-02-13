import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Post,
  Body,
  Logger,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from '~/modules/users/users.service';
import { AuthorizationGuard } from '~/authorization/authorization.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ServerRequest } from '~/types';
import { User } from '@prisma/client';
import {
  UserCreateDto,
  UserPatchDto,
} from '~/modules/users/dtos/user-crud.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthorizationGuard)
  @Get()
  async getUsers(@Req() req: ServerRequest): Promise<User[]> {
    const us = await this.usersService.getUsers(req);
    return us;
  }

  @UseGuards(AuthorizationGuard)
  @Get(':id')
  async getUser(@Req() req: ServerRequest, @Param('id') id: number) {
    try {
      const u = await this.usersService.getUser(req, +id);
      return u;
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Post()
  @ApiBody({ type: UserCreateDto })
  async createUser(
    @Req() req: ServerRequest,
    @Body() userCreateDto: UserCreateDto,
  ) {
    try {
      return await this.usersService.createUser(req, userCreateDto);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Patch(':id')
  @ApiBody({ type: UserPatchDto, required: false })
  async updateUser(
    @Req() req: ServerRequest,
    @Param('id') id: number,
    @Body() userPatchDto: UserPatchDto,
  ) {
    try {
      return await this.usersService.updateUser(req, +id, userPatchDto);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }

  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  async deleteUser(@Req() req: ServerRequest, @Param('id') id: number) {
    try {
      return await this.usersService.deleteUser(req, +id);
    } catch (e) {
      this.logger.error(e, e.stack, req.auth);
      throw e;
    }
  }
}
