import { ConflictException, Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as b from "bcrypt";
import * as c from "crypto";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { MailerService } from '../mailer/mailer.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly conn: PrismaService, private readonly mailer: MailerService) {}
  private readonly logger = new Logger(AuthService.name);
  async registerUser(username: string, email: string, password: string, ip: string) {
      const hash = await b.hash(password, 12);
      try {
      const user = await this.conn.user.create({
        data: {username, email, password: hash },
        select: { id: true, username: true },
      });

      return { id: user.id, username: user.username };
    } catch (err) {
      this.logger.log(`Invalid registration from ${ip}`)
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new ConflictException('Username not unique');
        }
      }
      throw err;
    }
  }
  async loginUser(identifier: string, password: string) {
    const userQuery = await this.conn.user.findFirst({
      where: {
        OR: [
          { username: identifier  },
          { email: identifier },
        ],
      },
      select: {id: true, username: true, password: true},
    });

    const DUMMY_HASH = process.env.DUMMY_HASH;
    if (!DUMMY_HASH) throw new Error('DUMMY_HASH není nastavený');

    const passMatch = await b.compare(password, userQuery?.password ?? DUMMY_HASH);
    if (!passMatch) {
      throw new UnauthorizedException('Invalid identifier or password');
    }

    return {id: userQuery?.id, username: userQuery?.username };
  }
  async createEmailCode(userId: number) {
    
  }
  async verifyCode(code: string, userId: number): Promise<boolean> {
    const res = await this.conn.email_code.findFirst({
      where: {
        AND: [
          { user_id: userId },
          { code }
        ]
      }
    })
    if (res) {
      return true;
    } else {
      return false;
    }
  }
  async deleteUser(id: number) {
    try {
      await this.conn.user.delete({
        where: {id},
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundException(`User ${id} not found`)
      }
      throw err;
    }
  }
  async getUser(username: string) {
    return await this.conn.user.findFirst({
      where: { username },
    });
  }
}