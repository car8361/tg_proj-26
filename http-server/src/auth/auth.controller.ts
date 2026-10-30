import {
  Controller, Get, Post, Body, HttpCode, Req, Ip, UseGuards, Res, Query, ConflictException,
  InternalServerErrorException, Delete, HttpException, HttpStatus, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from './dto/login.dto.js';
import type {Request, Response} from "express";
import { SessionUID } from './auth.guard.js';
import { SessionUserId } from '../common/decorators/session-user-id/session-user-id.decorator.js';
import {EmailDto, UsernameDto} from './dto/auth.dto.js';
import { $2faDto } from './dto/$2fa.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto, @Ip() ip: string) {
    const { username, email, password, confirmPassword } = body;
    if (password !== confirmPassword) {
      throw new HttpException("Passwords don't match", 400);
    }
    return this.authService.registerUser(username, email, password, ip);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const { identifier, password } = body;
    const user = await this.authService.loginUser(identifier, password);
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err: Error) => (err ? reject(err) : resolve()));
    });
    if (!user || !user.email) {
      throw new Error("Missing user error");
    }
    try {
      console.log("Sending mail: " + user.email);
      await this.authService.sendMailCode(user.email, user.id!);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException("Server Error while sending mail");
    }
    req.session.userId = String(user.id);
    req.session.verified = String(false);
    req.session.username = String(user.username);
    return;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const userId = req.session.userId;
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error) => (err ? reject(err) : resolve()));
    })
    res.clearCookie(process.env.SESSION_NAME!);
    this.authService.logoutEmit(userId);
    return {ok: true};
  }

  @Post('2fa')
  @UseGuards(SessionUID)
  @HttpCode(201)
  async _2fa(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response,
    @Body() body: $2faDto,
    @SessionUserId() userId: bigint,
  ) {
    console.log(body);
    const { code } = body;
    const verified = await this.authService.verifyCode(code, userId, req.ip ?? "Neznámá IP adresa");
    if (verified === "LOGOUT") {
      await new Promise((resolve, reject) => {
        req.session.destroy((err: Error) => { err ? reject(err) : resolve(true) });
      })
      res.clearCookie(process.env.SESSION_NAME!);
    }
    if (verified) {
      req.session.verified = true;
      return {ok: true};
    } else {
      throw new UnauthorizedException();
    }
  }

  @Delete()
  @UseGuards(SessionUID)
  @HttpCode(204)
  async del(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @SessionUserId() userId: bigint,
  ) {
    await this.authService.deleteUser(userId);
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.clearCookie('connect.sid');
    return {ok: true};
  }

  @Get('user')
  @HttpCode(200)
  async user(@Query() { username }: UsernameDto) {
    let user = await this.authService.getUser(username);
    if (!user?.id) {
      return;
    }
    throw new ConflictException();
  }

  @Get('email')
  @HttpCode(200)
  async email(@Query() { email }: EmailDto) {
    let user = await this.authService.getEmail(email);
    if (!user?.id) {
      return;
    }
    throw new ConflictException();
  }

  @Get('me')
  @HttpCode(200)
  async me(@Req() req: Request) {
    return {userId: req.session.userId, verified: req.session.verified, username: req.session.username};
  }
}
