import { ID } from "repository/IRepo";

export class User implements ID {
    id: string;
    name: string;
    email: string;
    password: string;    // hashed password
    createdAt: Date;
    role: string;        // user role, default 'user'

    constructor(
        id: string ,
        name: string,
        email: string,
        password: string,
        createdAt?: Date,   // optional, use DB date if exists
        role: string = 'user'  // default role
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

    getRole(): string {
        return this.role;
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

    setRole(role: string): void {
        this.role = role;
    }
}
