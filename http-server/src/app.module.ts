import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MailerModule } from './mailer/mailer.module.js';

@Module({
  imports: [AuthModule, PrismaModule, MailerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
