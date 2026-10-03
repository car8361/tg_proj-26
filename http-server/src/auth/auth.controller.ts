import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, Ip, Session, UseGuards, Res, Query, ParseUUIDPipe, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from './dto/login.dto.js';
import type {Request, Response} from "express";
import { SessionUID, SessionVerified } from './auth.guard.js';
import { SessionUserId } from '../common/decorators/session-user-id/session-user-id.decorator.js';
import {EmailDto, UsernameDto} from './dto/auth.dto.js';
import { $2faDto } from './dto/$2fa.dto.js';
import { MailerService } from '../mailer/mailer.service.js';
import {SessionData} from "express-session";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailer: MailerService,
  ) {}

  @Post('register')
  register(@Body() body: RegisterDto, @Ip() ip: string) {
    const { username, email, password } = body;
    return this.authService.registerUser(username, email, password, ip);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const { identifier, password } = body;
    const user = await this.authService.loginUser(identifier, password);
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    this.authService.sendMailCode(user.email!, user.id!);
    req.session.userId = user.id;
    req.session.verified = false;
    return user;
  }

  @Post('2fa')
  @UseGuards(SessionVerified)
  async _2fa(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: $2faDto,
    @SessionUserId() userId: number,
  ) {
    const { code } = body;
    const verified = await this.authService.verifyCode(code, userId, req.ip ?? "Neznámá IP adresa");
    if (verified) {
      req.session.verified = true;
      return res.status(201);
    } else {
      return res.status(401);
    }
  }

  @Post('delete')
  @UseGuards(SessionUID)
  async del(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @SessionUserId() userId: number,
  ) {
    await this.authService.deleteUser(userId);
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.clearCookie('connect.sid');
    return;
  }

  @Get('user')
  async user(@Query() { username }: UsernameDto) {
    let user = await this.authService.getUser(username);
    if (!user?.id) {
      return;
    }
    throw new ConflictException();
  }

  @Get('email')
  async email(@Query() { email }: EmailDto) {
    let user = await this.authService.getEmail(email);
    if (!user?.id) {
      return;
    }
    throw new ConflictException();
  }

  @Get('me')
  async me(@Req() req: Request, @Res() res: Response) {
    return res.status(200).json({userId: req.session.userId, verified: req.session.verified});
  }
}
