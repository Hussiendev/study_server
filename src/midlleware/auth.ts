import { AuthenticationFailedException} from "../util/exceptions/http/AuthenticationException";
import { AuthenticationServiceSingleton } from "../service/AuthenticationServiceSingleton";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../config/authRequest";

// From: src/middleware/auth.ts
const authService = AuthenticationServiceSingleton.getInstance();

export async function authenticate(req: Request, res: Response, next: NextFunction) {

    const authToken = req.cookies.auth_token;
    const refreshToken = req.cookies.refreshToken;
  

    try {

        if (authToken) {
            const payload = authService.verifyAccessToken(authToken);
            (req as AuthRequest).user = payload;
            return next();
        }

        if (!refreshToken) {
            return next(new AuthenticationFailedException());
        }

        const { newAccess, newRefresh } =
            await authService.refresh(refreshToken);

        authService.setAccessCookie(res, newAccess);
        authService.setRefreshCookie(res, newRefresh);

        const payload = authService.verifyAccessToken(newAccess);
        (req as AuthRequest).user = payload;

        next();

    } catch (error) {
        return next(new AuthenticationFailedException());
    }
}
