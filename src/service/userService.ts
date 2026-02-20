import { createUserRepo, UserRepo } from "../repository/User.repo";
import { User } from "../models/Usermodel";

import { BadRequestException } from "../util/exceptions/http/BadRequestException";

import logger from "../util/logger";
import bcrypt from "bcrypt";

export class UserService {

    private userRepo!: UserRepo;

    // -------------------------
    // CREATE USER
    // -------------------------
    public async createUser(user: User): Promise<User> {
        logger.info(`Creating user with email: ${user.getEmail()}`);

        this.validateNewUser(user);

        await (await this.getRepo()).create(user);

        return user;
    }

    // -------------------------
    // GET USER
    // -------------------------
    public async getUser(id: string): Promise<User> {
        logger.info(`Fetching user with id: ${id}`);
        return await (await this.getRepo()).get(id);
    }

    // -------------------------
    // GET ALL USERS
    // -------------------------
    public async getAllUsers(): Promise<User[]> {
        logger.info("Fetching all users");
        return await (await this.getRepo()).getALL();
    }

    // -------------------------
    // UPDATE USER
    // -------------------------
    public async updateUser(user: User): Promise<void> {
        logger.info(`Updating user with id: ${user.getId()}`);

        this.validateUpdateUser(user);

        await (await this.getRepo()).update(user);
    }

    // -------------------------
    // DELETE USER
    // -------------------------
    public async deleteUser(id: string): Promise<void> {
        logger.info(`Deleting user with id: ${id}`);
        await (await this.getRepo()).delete(id);
    }

    // -------------------------
    // LOGIN VALIDATION
    // -------------------------
    public async validate(email: string, password: string): Promise<User> {
        logger.info(`Validating user with email: ${email}`);

        const user = await (await this.getRepo()).getsUserbyEmail(email);

        const isMatch = await bcrypt.compare(password, user.getPassword());

        if (!isMatch) {
            throw new BadRequestException("Invalid password");
        }
        

        return user;
    }
    async updatedLoggedUser(email:string):Promise<void>{
        await (await this.getRepo()).Update_USER_VERF(email);

    }

    // -------------------------
    // VALIDATION FOR CREATE
    // -------------------------
    private validateNewUser(user: User): void {
        const email = user.getEmail();
        const name = user.getName();
        const password = user.getPassword();

        if (!name || !email || !password) {
            throw new BadRequestException(
                "Name, email, and password are required."
            );
        }

        this.validateEmail(email);

        if (password.length < 6) {
            throw new BadRequestException(
                "Password must be at least 6 characters long."
            );
        }
    }

    // -------------------------
    // VALIDATION FOR UPDATE
    // -------------------------
    private validateUpdateUser(user: User): void {
        if (!user.getId()) {
            throw new BadRequestException("User ID is required for update.");
        }

        if (user.getEmail()) {
            this.validateEmail(user.getEmail());
        }

        if (user.getPassword() && user.getPassword().length < 6) {
            throw new BadRequestException(
                "Password must be at least 6 characters long."
            );
        }
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new BadRequestException("Invalid email format.");
        }
    }

    private async getRepo(): Promise<UserRepo> {
        if (!this.userRepo) {
            this.userRepo = await createUserRepo();
        }
        return this.userRepo;
    }
}
