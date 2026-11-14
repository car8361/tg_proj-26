import {Body, Controller, Delete, Get, HttpCode, Patch, Post, Req, Res, UseGuards} from '@nestjs/common';
import { MeService } from './me.service.js';
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {PatchMeDto, PostPictureDto} from "./dto/me.dto.js";
import {ObjectService} from "../object/object.service.js";
import {SessionUID} from "../auth/auth.guard.js";
import type {Request, Response} from "express";

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService, private readonly objectService: ObjectService) {}

  @Get("/")
  async getMe(@SessionUserId() userId: bigint) {
    const result = await this.meService.getMe(userId);
    console.log("SERVICE RESULT: ", result, "\n\n\n\n\n");
    return result;
  }

  @Patch("/")
  async patchMe(@SessionUserId() userId: bigint, @Body() body: PatchMeDto) {
    return await this.meService.patchMe(userId, body.description)
  }

  @Post("/picture")
  async uploadMe(@SessionUserId() userId: bigint, @Body() body: PostPictureDto) {
    const {url, path} = await this.objectService.uploadImage(body.fileType);
    await this.meService.savePicture(userId, path);
    return url;
  }

  @Delete()
  @UseGuards(SessionUID)
  @HttpCode(204)
  async del(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
      @SessionUserId() userId: bigint,
  ) {
    await this.meService.deleteUser(userId);
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.clearCookie('connect.sid');
    return {ok: true};
  }
}
