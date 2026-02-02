import { ID } from "repository/IRepo";

export class User implements ID {
    id: string;
    email: string;
    name: string;
    password: string;    // hashed password
    createdAt: Date;

    constructor(
        id: string ,
        email: string,
        name: string,
        password: string,
        createdAt?: Date   // optional, use DB date if exists
    ) {
  
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt || new Date();
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
}
