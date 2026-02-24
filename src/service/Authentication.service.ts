import jwt from 'jsonwebtoken';
import config from '../config';
import { UserPayload } from '../config/tokenPayload';
import { AuthenticationException, InvalidTokenException } from '../util/exceptions/http/AuthenticationException';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import ms from 'ms';
import crypto from 'crypto';
import { createUserRepo,UserRepo } from '../repository/User.repo';


export class AuthenticationService {
     private userRepo!: UserRepo;

    constructor(
        private accessSecret = config.auth.jwtSecret,
        private refreshSecret = config.auth.RefreshSecret,
        private expiration = config.auth.expiration,
        private refreshExpiration = config.auth.refreshExpiration,
        private resetExpiration=config.auth.resetExpiration
    ){}

    generateAccessToken(payload: UserPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.expiration });
    }

    generateRefreshToken(payload: UserPayload): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiration });
    }
// In AuthenticationService.ts
generatePasswordResetToken(): { code: string; expiresAt: Date } {
    // Generate 6-digit code
    const min = 100000;
    const max = 999999;
    const code = crypto.randomInt(min, max + 1).toString();
    
    // Calculate expiration date (e.g., 15 minutes from now)
    const expiresAt = new Date(Date.now() + ms(this.resetExpiration));
    
    return { code, expiresAt };
}

    verifyAccessToken(token: string): UserPayload {
        try {
            return jwt.verify(token, this.accessSecret) as UserPayload;
        } catch {
            throw new AuthenticationException('Invalid access token');
        }
    }

    verifyRefreshToken(token: string): UserPayload {
        try {
            return jwt.verify(token, this.refreshSecret) as UserPayload;
        } catch {
            throw new InvalidTokenException();
        }
    }
    verifyPasswordResetToken(token: string): { userId: string } {
        try {
            const decoded = jwt.verify(token, config.auth.jwtSecret) as { 
                userId: string 
            };
            
            return { userId: decoded.userId };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationException('Reset token has expired');
            }
            throw new AuthenticationException('Invalid or malformed reset token');
        }
    }

    async persistAuthentication(
        res: Response,
        payload: UserPayload,
       
    ) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        const hashedRefresh = await bcrypt.hash(refreshToken, 10);

        this.setAccessCookie(res, accessToken);
        this.setRefreshCookie(res, refreshToken);
               const expired=new Date(
  Date.now() + ms(this.refreshExpiration)
)
        await (await this.getRepo()).updateRefreshToken(payload.userId, hashedRefresh,expired);

      
    }

    async refresh(
        refreshToken: string,
      
    ) {
        const payload = this.verifyRefreshToken(refreshToken);

        const user = await (await this.getRepo()).get(payload.userId);

        if (!user.getRefeshToken()) {
            throw new InvalidTokenException();
        }

        const isMatch = await bcrypt.compare(
            refreshToken,
            user.getRefeshToken()
        );

        if (!isMatch) {
            throw new InvalidTokenException();
        }

        // ROTATION
        const newAccess = this.generateAccessToken(payload);
        const newRefresh = this.generateRefreshToken(payload);

        const hashed = await bcrypt.hash(newRefresh, 10);
        const expired=new Date(
  Date.now() + ms(this.refreshExpiration)
)
        await (await this.getRepo()).updateRefreshToken(payload.userId, hashed,expired);

        return { newAccess, newRefresh };
    }
   // In AuthenticationService.ts
async persistReset(
    res: Response,
    payload: UserPayload,
) {
    // Generate code and expiration together
    const { code, expiresAt } = this.generatePasswordResetToken();
    
    // Hash the code for storage
    const hashedReset = await bcrypt.hash(code, 10);

    // Set cookie with the plain code (if needed)
    this.setResetCookie(res, code);
    
    // Store hashed code and expiration in database
    await (await this.getRepo()).updateResetToken(
        payload.userId, 
        hashedReset, 
        expiresAt  // Use the expiresAt from generatePasswordResetToken
    );
    
    // Return the plain code to be sent via email
    return code;
}


    setAccessCookie(res: Response, token: string) {
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: config.is_Production,
            maxAge: ms(this.expiration)
        });
    }

    setRefreshCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: config.is_Production,
            maxAge: ms(this.resetExpiration)
        });
    }
    setResetCookie(res:Response,token:string){
          res.cookie('resetToken', token, {
            httpOnly: true,
            secure: config.is_Production,
            maxAge: ms(this.refreshExpiration)
        });
    
    }
   
   
    async logout(userId: string) {
               const expired=new Date(
  Date.now() + ms(this.refreshExpiration)
)
    await(await this.getRepo()).Logout(userId)
        await (await this.getRepo()).updateRefreshToken(userId, null,null);
       return true;
    }
     private async getRepo(): Promise<UserRepo> {
            if (!this.userRepo) {
                this.userRepo = await createUserRepo();
            }
            return this.userRepo;
        }
}
