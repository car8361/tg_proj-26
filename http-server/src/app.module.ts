import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MailerModule } from './mailer/mailer.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { RelationsModule } from './relations/relations.module.js';
import { ReportsModule } from './reports/reports.module.js';

@Module({
  imports: [AuthModule, PrismaModule, MailerModule, UsersModule, ChatsModule, RelationsModule, ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
