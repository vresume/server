import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '~/modules/users/users.service';
import { AuthorizationGuard } from '~/authorization/authorization.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsGuard } from '~/authorization/permissions.guard';
import { UsersPermissions } from '~/authorization/permissions/users.permissions';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthorizationGuard)
  @Get(':id')
  async getUser(@Request() req: any, @Param('id') requestedUserID: number) {
    // if (req.auth.payload.permissions.includes(UsersPermissions.ReadAdmin)) {
    //   return await this.usersService.getUserById(requestedUserID);
    // } else {
    //   const authUser = await this.usersService.getUserByAuthId(
    //     req.auth.payload.sub,
    //   );
    //   if (authUser.id !== requestedUserID) {
    //     throw new ForbiddenException('Permission denied');
    //   }
    //   return authUser;
    // }
    return {};
  }
}
