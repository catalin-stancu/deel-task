export type RequestUser = {
    id: number;
}

declare global {
    namespace Express {
        interface Request {
            profile?: RequestUser
        }
    }
}
