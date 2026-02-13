import logger from "../util/logger";
import { User } from "../models/Usermodel";


export class UserBuilder {
    private id!: string;
    private name!: string;
    private email!: string;
    private password!: string;
    private role: string = 'user';

    public static createBuilder(): UserBuilder {
        return new UserBuilder();
    }

    setId(id: string): this {
        this.id = id;
        return this;
    }

    setName(name: string): this {
        this.name = name;
        return this;
    }

    setEmail(email: string): this {
        this.email = email;
        logger.info(`Setting email in UserBuilder: ${email}`);
        return this;
    }

    setPassword(password: string): this {
        this.password = password;
        return this;
    }

    setRole(role: string): this {
        this.role = role;
        return this;
    }

    build(): User {
        const required = [this.id, this.name, this.email, this.password];
        for (const field of required) {
            if (field === undefined) {
                throw new Error("Missing required fields to build User");
            }
        }
        return new User(this.id, this.name, this.email, this.password, undefined, this.role);
    }
}


