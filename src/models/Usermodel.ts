import { ID } from "repository/IRepo";
import { ROLE } from "../config/roles";
export class User implements ID {
    id: string;
    name: string;
    email: string;
    password: string;    // hashed password
    createdAt: Date;
    role: ROLE;
    refresh_token!:string        // user role, default 'user'

    constructor(
        id: string ,
        name: string,
        email: string,
        password: string,
        createdAt?: Date,   // optional, use DB date if exists
        role: ROLE = ROLE.USER  // default role
    ) {
  
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt || new Date();
        this.role = role;
    }

    // Getters
    getId(): string  {
        return this.id;
    }

    getEmail(): string {
        return this.email;
    }

    getName(): string {
        return this.name;
    }

    getPassword(): string {
        return this.password;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getRole(): ROLE {
        return this.role;
    }
    getRefeshToken(){
        return this.refresh_token;
    }

    // Setters
    setId(id: string): void {
        this.id = id;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    setName(name: string): void {
        this.name = name;
    }

    setPassword(password: string): void {
        this.password = password;
    }

    setCreatedAt(date: Date): void {
        this.createdAt = date;
    }

    setRole(role: ROLE): void {
        this.role = role;
    }
}
