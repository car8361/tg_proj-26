import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
    constructor() {
        super({
            adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})
        })
    }

    onModuleInit() {
        try {
            this.$connect;
            this.$executeRaw`SELECT 1`;
        } catch (err) {
            console.error("Database connection error", err);
            throw err;
        }
    }

    onModuleDestroy() {
        this.$disconnect;
    }
}
