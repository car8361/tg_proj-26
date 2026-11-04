import { Controller } from '@nestjs/common';
import { ObjectService } from './object.service.js';

@Controller('object')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}
}
