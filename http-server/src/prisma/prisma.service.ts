import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
    constructor() {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required");
      }
        super({
            adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})
        })
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.$executeRaw`SELECT 1`;
        } catch (err) {
            console.error("Database connection error", err);
            throw err;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
