import { AuthenticationService } from "../service/Authentication.service";
import { UserService } from "../service/userService";
import { Request, Response } from "express";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import { AuthRequest } from "config/authRequest";
import { toRole } from "../config/roles";
import { EmailService } from "../service/Emailservice";
import logger from "../util/logger";
export class AuthController {
    constructor(
        private authService: AuthenticationService,
        private userService: UserService,
        private emailService:EmailService
    ){}
    public async login(req:Request,res:Response){
    
            const {email,password} = req.body;
            if(!email || !password){
               throw new BadRequestException ("Email and password are required");
            }
            const user= await this.userService.validate(email,password);
          this.authService.persistAuthentication(res,{userId:user.id,role:toRole(user.role)} );
            await this.userService.updatedLoggedUser(user.email);
            res.json({message:'Login successful'});
        
      
      
        
    }
    public async  logout(req:Request,res:Response){
        const auth_request=req as AuthRequest;
        this.authService.logout(auth_request.user.userId);
            res.clearCookie('auth_token');
    res.clearCookie('refreshToken');
        res.json({message:'Logout successful'});
    }
    public async forgetpass(req:Request,res:Response){
        const {email}=req.body;
        if(!email){
              throw new BadRequestException ("Email is required");


        }
        const user= await this.userService.get_user_bymail(email);
        const token = await this.authService.persistReset(res,{userId:user.id,role:toRole(user.role)} );

        await this.emailService.sendPasswordResetEmail(email,token);
        res.status(200).json('sent mail');
    }
    // In AuthController.ts
public async updatePass(req: Request, res: Response): Promise<void> {
    const { token, email, pass } = req.body;
    
    if (!token || !email || !pass) {
        throw new BadRequestException("Email, token, and new password are required");
    }

    logger.info(`Password reset attempt for email: ${email}`);

    // STEP 1: Verify the token FIRST
    const isValid = await this.authService.verifyResetToken(email, token);
    
    if (!isValid) {
        throw new BadRequestException("Invalid or expired reset token");
    }

    // STEP 2: Only if token is valid, update the password
    await this.userService.updateuserpass(email, pass);
    
    // STEP 3: Clear the used token
    await  this.authService.clearResetToken(email);

    logger.info(`Password updated successfully for email: ${email}`);
    res.status(200).json({ message: 'Password updated successfully' });
}
}