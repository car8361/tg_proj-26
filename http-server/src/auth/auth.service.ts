import { ConflictException, Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as b from "bcrypt";
import { randomInt } from "node:crypto";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { MailerService } from '../mailer/mailer.service.js';
import {SocketGateway} from "../socket/socket.gateway.js";

@Injectable()
export class AuthService {
  constructor(private readonly conn: PrismaService, private readonly mailer: MailerService, private readonly gateway: SocketGateway) {}
  async registerUser(username: string, email: string, password: string, ip: string) {
      const hash = await b.hash(password, 12);
      try {
      const user = await this.conn.user.create({
        data: {username, email, password: hash },
        select: { id: true, username: true },
      });

      return { id: user.id.toString(), username: user.username };
    } catch (err) {
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
  async sendMailCode(email: string, userId: bigint) {
    let code = randomInt(1000000).toString();
    while (code.length !== 6) {
      code = `0${code}`;
    }
    await this.conn.email_code.deleteMany({
      where: {user_id: userId}
    });
    await this.conn.email_code.create({
      data: {user_id: userId, email, code, attempts: 0},
    })
    this.mailer.sendMail(
      email,
      `Your verification code`,
      `Your verification code is: ${code}.\nIt is going to expire in 5 minutes. Please do not share this code with anybody.`,
      `<div>Your verification code is: ${code}.\nIt is going to expire in 5 minutes. Please do not share this code with anybody.</div>`
    )
  }
  async verifyCode(code: string, userId: bigint, ip: string): Promise<boolean | string> {
    const res = await this.conn.email_code.findFirst({
      where: { user_id: userId },
    })
    if (!res) {
      return false;
    }
    if (new Date() > res.due_until) {
      console.log("Deleting");
      await this.conn.email_code.deleteMany({
        where: {id: res.user_id}
      });
      return false;
    }
    if (res.attempts >= 3) {
      try {
        await this.conn.email_code.delete({
          where: {id: res.user_id}
        });
        return "LOGOUT";
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2025") {
            throw new ConflictException("Code does not exist")
          }
        }
      }
      console.log("Mail to be sent the sus activity: ", res.email);
      this.mailer.sendMail(
        res.email,
        `Suspicious activity`,
        `Somebody is trying to log into your account from: ${ip}.`,
        `<div>Somebody is trying to log into your account from: ${ip}.<div>`,
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
  async deleteUser(id: bigint) {
    try {
      await this.conn.user.delete({
        where: {id},
      });
      this.gateway.exitRoom(id.toString());
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
  logoutEmit(id: bigint) {
    return this.gateway.exitRoom(id.toString());
  }
}