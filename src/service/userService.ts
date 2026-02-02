import { UserRepo } from "repository/User.repo";
import { User } from "../models/Usermodel";

export class UserService{
    constructor(private userRepo:UserRepo){}
    public async CreatUser(user:User):Promise<User>{
        try{
            await this.Validate_User(user);
            const new_user=await this.userRepo.create(user);
            return user;

        }
        catch(error){
            throw error;
        }
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private async Validate_User(user:User):Promise<void>{
        // Check that all fields are not empty
        if (!user.id || user.id.trim() === '') {
            throw new Error('User ID cannot be empty');
        }
        if (!user.name || user.name.trim() === '') {
            throw new Error('User name cannot be empty');
        }
        if (!user.email || user.email.trim() === '') {
            throw new Error('User email cannot be empty');
        }
        if (!user.password || user.password.trim() === '') {
            throw new Error('User password cannot be empty');
        }

        // Check that email is a valid email format
        if (!this.validateEmail(user.email)) {
            throw new Error('Email is not a valid email format');
        }
    }

}