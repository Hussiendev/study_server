import jwt from 'jsonwebtoken';
import config from '../config';
import { UserPayload } from '../config/tokenPayload';
import { AuthenticationException, InvalidTokenException } from '../util/exceptions/http/AuthenticationException';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import ms from 'ms';
import { createUserRepo,UserRepo } from '../repository/User.repo';

export class AuthenticationService {
     private userRepo!: UserRepo;

    constructor(
        private accessSecret = config.auth.jwtSecret,
        private refreshSecret = config.auth.RefreshSecret,
        private expiration = config.auth.expiration,
        private refreshExpiration = config.auth.refreshExpiration
    ){}

    generateAccessToken(payload: UserPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.expiration });
    }

    generateRefreshToken(payload: UserPayload): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiration });
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
