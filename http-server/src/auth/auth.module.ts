import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import {SocketGateway} from "../socket/socket.gateway.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, SocketGateway],
})
export class AuthModule {}
