import { User } from "../models/Usermodel";
import { IMapper } from "./IMapper";
import { UserBuilder } from "../builder/User.builder";
import { idGenerater } from "../util/IDgenerater";
import logger from "../util/logger";
import { ROLE, toRole } from "../config/roles";

 export interface SQLUser {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    role: string;
    is_verified?: boolean;
    last_login?: Date;
    reset_pass_token?: string;
    reset_pass_expires_at?: Date;
    refresh_token?: string;
    refresh_token_expires_at?: Date;
}
export interface JSONUSER {
   
    name: string;
    email: string;
    password: string;
    role?: ROLE;
}
export class SQLMapper implements IMapper<SQLUser,User > {
    map(input: SQLUser): User {
        return UserBuilder.createBuilder()
        .setId (input.id)
        .setName(input.name)
        .setEmail(input.email)
        .setPassword (input.password)
        .setRole(toRole(input.role))
        .build();
      
    }
    reversemap(input: User): SQLUser {
       return {
        id: input.getId(),
         name: input.getName(),
        email: input.getEmail(),
       
        password: input.getPassword(),
        createdAt: input.getCreatedAt(),
        role: input.getRole()
       };

    }
    
}
export class JSONMapper implements IMapper<any,User > {
    map(input: any): User {
        logger.info(`Mapping JSON to User: ${JSON.stringify(input)}`);
       return UserBuilder.createBuilder()
       .setId (idGenerater("user"))
           .setName(input.name)
       .setEmail(input.email)
   
       .setPassword (input.password)
     .setRole(input.role ? toRole(input.role) : ROLE.USER)
       .build();
    }
    reversemap(input: User):JSONUSER {
        return {
            
       
            name: input.getName(),
              email: input.getEmail(),
              password: input.getPassword(),
              role: input.getRole()
           
        };
    }
    
}
