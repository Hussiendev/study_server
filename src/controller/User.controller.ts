import logger from "../util/logger";
import { JSONMapper } from "../mapper/User.Mapper";
import { User } from "../models/Usermodel";
import { UserService } from "../service/userService";
import { BadRequestException } from "../util/exceptions/http/BadRequestException";
import { Request, Response } from "express";
import { hash } from "bcrypt";

export class UserController {
    constructor(private readonly userService: UserService) {}

    // -------------------------
    // CREATE USER
    // -------------------------
    public async createUser(req: Request, res: Response): Promise<void> {
        logger.info("Received request to create user");

        const userData: User = new JSONMapper().map(req.body);

        // Always hash password before saving
        userData.setPassword(await hash(userData.getPassword(), 10));

        const createdUser = await this.userService.createUser(userData);

        res.status(201).json({
            message: "User created successfully",
            user: new JSONMapper().reversemap(createdUser)
        });
    }

    // -------------------------
    // GET USER BY ID
    // -------------------------
    public async getUser(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;

        if (!userId) {
            throw new BadRequestException("User ID is required", { userId });
        }

        logger.info(`Fetching user with id: ${userId}`);

        const user = await this.userService.getUser(userId);

        res.status(200).json({
            message: "User retrieved successfully",
            user: new JSONMapper().reversemap(user)
        });
    }

    // -------------------------
    // GET ALL USERS
    // -------------------------
    public async getAllUsers(req: Request, res: Response): Promise<void> {
        logger.info("Fetching all users");

        const users = await this.userService.getAllUsers();
        const mappedUsers = users.map(user =>
            new JSONMapper().reversemap(user)
        );

        res.status(200).json({
            message: "Users retrieved successfully",
            count: mappedUsers.length,
            users: mappedUsers
        });
    }

    // -------------------------
    // UPDATE USER
    // -------------------------
    public async updateUser(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;

        if (!userId) {
            throw new BadRequestException("User ID is required", { userId });
        }

        logger.info(`Updating user with id: ${userId}`);

        const userData: User = new JSONMapper().map(req.body);
        userData.setId(userId);

        // Hash password only if provided
        if (userData.getPassword()) {
            userData.setPassword(await hash(userData.getPassword(), 10));
        }

        await this.userService.updateUser(userData);

        res.status(200).json({
            message: "User updated successfully"
        });
    }

    // -------------------------
    // DELETE USER
    // -------------------------
    public async deleteUser(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;

        if (!userId) {
            throw new BadRequestException("User ID is required", { userId });
        }

        logger.info(`Deleting user with id: ${userId}`);

        await this.userService.deleteUser(userId);

        res.status(200).json({
            message: "User deleted successfully",
            userId
        });
    }
}
