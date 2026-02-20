import  { JwtPayload } from "jsonwebtoken";
import { ROLE } from "./roles";
export interface UserPayload{
    userId: string;
    role: ROLE;
}
export interface TokenPayload  extends JwtPayload{
   user: UserPayload;
    
};