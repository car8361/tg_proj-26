import {Controller, Get, Param, Patch, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service.js';
import {SessionVerified} from "../auth/auth.guard.js";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SessionVerified)
  @Get('me')
  async getMe(username: string) {

  }

  @UseGuards(SessionVerified)
  @Patch('me')
  async patchMe() {

  }


  @UseGuards(SessionVerified)
  @Get(':userId')
  async user(@Param('userId') userId: string) {

  }


}
