import { Request } from "express";

import { UserPayload } from "./tokenPayload";
export interface AuthRequest extends Request {
    user:UserPayload
}