import { AuthenticationService } from "../service/Authentication.service";
import { UserService } from "../service/userService";
import { Request, Response } from "express";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import { AuthRequest } from "config/authRequest";
export class AuthController {
    constructor(
        private authService: AuthenticationService,
        private userService: UserService
    ){}
    public async login(req:Request,res:Response){
    
            const {email,password} = req.body;
            if(!email || !password){
               throw new BadRequestException ("Email and password are required");
            }
            const userId= await this.userService.validate(email,password);
          this.authService.persisAuthentication(res,userId);
            res.json({message:'Login successful'});
        
      
      
        
    }
    public async  logout(req:Request,res:Response){
        const auth_request=req as AuthRequest;
        this.authService.clearCookie(res);
        res.json({message:'Logout successful'});
    }
}