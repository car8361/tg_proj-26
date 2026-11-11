import {Body, Controller, Post, Req} from '@nestjs/common';
import { ObjectService } from './object.service.js';
import {UploadImg} from "./dto/object.dto.js";

@Controller('upload')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Post("profile")
  async uploadProfile(@Body() body: UploadImg) {
    const { fileType } = body;
    this.objectService.uploadImage(fileType);
  }
}
