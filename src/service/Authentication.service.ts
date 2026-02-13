import jwt from 'jsonwebtoken';
import  config  from '../config';
import { TokenPayload } from '../config/tokenPayload';
import { AuthenticationException, InvalidTokenException } from '../util/exceptions/http/AuthenticationException';
import { Response } from 'express';

import ms from 'ms';
import { AuthRequest } from 'config/authRequest';
export class AuthenticationService {
    constructor(
        private seceret=config.auth.jwtSecret,
        private expiration=config.auth.expiration,
          private refreshExpiration=config.auth.refreshExpiration
    ){}
     generateToken(userId:string):string{
        return jwt.sign({userId},this.seceret,{expiresIn:this.expiration});
    }
      generateRefreshToken(userId:string):string{
        return jwt.sign({userId},this.seceret,{expiresIn:this.refreshExpiration});
    }

     verifyToken(token:string):TokenPayload{
        try {
            return jwt.verify(token,this.seceret) as TokenPayload;
        } catch (error) {
            throw new AuthenticationException('Invalid token');
        }
}
    refreshToken(refreshToken:string){
 const payload=this.verifyToken(refreshToken);
 if(!payload){
    throw new InvalidTokenException();
}
 const newToken=this.generateToken(payload.userId);
    return newToken;
}

    setCookie(res:Response,token:string){
        res.cookie('auth_token',token,{
            httpOnly:true,
            secure:config.is_Production,
          
            maxAge:ms(this.expiration)
        });
    }
    setRefreshTokenInCookie(res:Response,refreshToken:string){
    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure:config.is_Production,
        maxAge:ms(this.refreshExpiration)
    });
}
    clearCookie(res:Response){
        res.clearCookie('auth_token');
        res.clearCookie('refreshToken');
    }
    persisAuthentication(res:Response,userId:string){
     const token=  this.generateToken(userId);
        const refreshToken=this.generateRefreshToken(userId);
       
         this.setCookie(res,token);
           this.setRefreshTokenInCookie(res,refreshToken);
         
}
}