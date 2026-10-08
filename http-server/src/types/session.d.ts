import "express-session"

declare module 'express-session' {
    interface SessionData {
        userId: bigint;
        verified: boolean;
    }
}

