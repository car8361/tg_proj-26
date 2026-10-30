import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MailerModule } from './mailer/mailer.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { RelationsModule } from './relations/relations.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { SocketModule } from './socket/socket.module.js';
import {UserIdThrottlerGuard} from "./common/extensions/throttler.extension.js";
import { ThrottlerModule } from "@nestjs/throttler";
import {APP_GUARD} from "@nestjs/core";

@Module({
  imports: [AuthModule, PrismaModule, MailerModule, UsersModule, ChatsModule, RelationsModule, ReportsModule, SocketModule, ThrottlerModule.forRoot({
    throttlers: [
      {
        ttl: 60000,
        limit: 25
      }
    ],
  })],
  controllers: [],
  providers: [{provide: APP_GUARD, useClass: UserIdThrottlerGuard}],
})
export class AppModule {}
