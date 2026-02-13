import { AuthenticationFailedException, ExpiredTokenException } from "../util/exceptions/http/AuthenticationException";
import { AuthenticationServiceSingleton } from "../service/AuthenticationServiceSingleton";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../config/authRequest";
import logger from "../util/logger";
// From: src/middleware/auth.ts
const authService = AuthenticationServiceSingleton.getInstance();

export function authenticate(req: Request, res: Response, next: NextFunction) {
        let authToken = req.cookies.auth_token;
        const refreshToken = req.cookies.refreshToken;
        logger.info('authToken:', authToken, 'refreshToken:', refreshToken);
       

        if (!authToken) {
                if(!refreshToken){
                        return next(new AuthenticationFailedException());
                }
         const newtoken=authService.refreshToken(refreshToken);
         authService.setCookie(res,newtoken);
         authToken=newtoken;
         logger.info('New authToken generated from refresh token');       
              

        }
                const payload = authService.verifyToken(authToken);
                (req as AuthRequest).userId = payload.userId; // Attach userId to request
                next(); // Proceed to the next middleware or route handler
        
}