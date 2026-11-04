import { Controller } from '@nestjs/common';
import { MeService } from './me.service.js';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}
}
