import {Controller, Get, Req, Res} from '@nestjs/common';
import { MeService } from './me.service.js';
import type { Request } from "express";

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("info")
  async getMe(@Req() req: Request) {

  }
}
