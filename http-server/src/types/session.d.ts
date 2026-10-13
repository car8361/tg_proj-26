import "express-session"

declare module 'express-session' {
    interface SessionData {
        userId: bigint;
        verified: boolean;
    }
}

declare module 'http' {
    interface IncomingMessage {
        session: Session & Partial<SessionData>
    }
}

