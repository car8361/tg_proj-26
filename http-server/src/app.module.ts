import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MailerModule } from './mailer/mailer.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { MeModule } from './me/me.module.js';
import { FriendsModule } from './friends/friends.module.js';

@Module({
  imports: [AuthModule, PrismaModule, MailerModule, UsersModule, ChatsModule, MeModule, FriendsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
