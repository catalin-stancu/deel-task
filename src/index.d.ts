import { PROFILE_TYPE } from './enums/enums';

export type RequestProfile = {
    id: number;
    type: PROFILE_TYPE;
}

declare global {
    namespace Express {
        interface Request {
            profile?: RequestProfile
        }
    }
}
