import { ConflictException, Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as b from "bcrypt";
import { randomInt } from "node:crypto";
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
      select: {id: true, email: true, username: true, password: true},
    });

    const DUMMY_HASH = process.env.DUMMY_HASH;
    if (!DUMMY_HASH) throw new Error('DUMMY_HASH není nastavený');

    const passMatch = await b.compare(password, userQuery?.password ?? DUMMY_HASH);
    if (!passMatch) {
      throw new UnauthorizedException('Invalid identifier or password');
    }

    return {id: userQuery?.id, email: userQuery?.email, username: userQuery?.username };
  }
  async sendMailCode(email: string, userId: number) {
    const code = randomInt(1000000).toString();
    await this.conn.email_code.create({
      data: {user_id: userId, email, code, attempts: 0},
    })
    this.mailer.sendMail(
      [email],
      `Váš verifikační kód`,
      `Váš verifikační kód je: ${code}.\nVyprší za 5 minut, prosím s nikým nesdílejte.`,
      `<div>Váš verifikační kód je: ${code}.\nVyprší za 5 minut, prosím s nikým nesdílejte.</div>`
    )
  }
  async verifyCode(code: string, userId: number, ip: string): Promise<boolean> {
    const res = await this.conn.email_code.findFirst({
      where: { user_id: userId },
    })
    if (!res) {
      return false;
    }
    if (new Date() > res.due_until) {
      await this.conn.email_code.delete({
        where: {id: res.user_id}
      });
      return false;
    }
    if (res.attempts >= 3) {
      await this.conn.email_code.delete({
        where: {id: res.user_id}
      });
      await this.mailer.sendMail(
        [res.email],
        `Podezřelá aktivita`,
        `Někdo se pokouší přihlásit do Vašeho účtu z ${ip}.`,
        `<div>Někdo se pokouší přihlásit do Vašeho účtu z ${ip}.<div>`,
      );
      return false;
    }
    if (res?.code !== code) {
      await this.conn.email_code.update({
        where: {id: res.id},
        data: { attempts: res.attempts + 1 },
      })
      return false;
    }
    return true;
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
    return this.conn.user.findFirst({
      where: { username },
    });
  }
  async getEmail(email: string) {
    return this.conn.user.findFirst({
      where: { email },
    });
  }
}