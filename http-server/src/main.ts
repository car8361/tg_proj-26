import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import session from "express-session";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { json } from "express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import {GlobalInterceptor} from "./common/decorators/logger-interceptor/logger.interceptor.js";
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['debug', 'log', 'warn', 'error', 'fatal'],
      json: process.env.PRODUCTION === "true",
      colors: process.env.NODE_ENV === "true"
    })
  });
  app.set("trust proxy", 1);
  app.setGlobalPrefix("api");
  app.use(json());
  const config = new DocumentBuilder()
      .setTitle("API Documentation")
      .setDescription("This is mostly the list of all endpoints currently - only the ones implemented in the frontend will work, when I was writing the backend code without debugging I didn't know I had to serialize bigint manually")
      .setVersion("2")
      .addTag("api")
      .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.enableCors({
    origin: process.env.FRONTEND_PORT ?? "http://localhost:80",
    credentials: true
  })
  app.use(session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 86400000}
  }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  app.useGlobalInterceptors(new GlobalInterceptor());
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log("Listening on port: ", process.env.PORT ?? 3000);
  });
}
await bootstrap();
