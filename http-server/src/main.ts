import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import session from "express-session";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { json } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === "production",
      colors: process.env.NODE_ENV !== "production"
    })
  });
  app.setGlobalPrefix("api");
  app.use(json());
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
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log("Listening on port: ", process.env.PORT ?? 3000);
  });
}
await bootstrap();
