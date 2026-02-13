"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const logger_1 = __importDefault(require("../util/logger"));
const User_Mapper_1 = require("../mapper/User.Mapper");
const BadRequestException_1 = require("../util/exceptions/http/BadRequestException");
const NotFoundException_1 = require("../util/exceptions/http/NotFoundException");
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    // Create user
    CreateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = new User_Mapper_1.JSONMapper().map(req.body);
            logger_1.default.info(`Received request to create user with email: ${userData.getEmail()}`);
            if (!userData) {
                throw new BadRequestException_1.BadRequestException("Invalid user data", {
                    invalidData: req.body
                });
            }
            const createdUser = yield this.userService.CreatUser(userData);
            res.status(201).json({ message: "User created successfully", user: new User_Mapper_1.JSONMapper().reversemap(createdUser) });
        });
    }
    // Get user by ID
    GetUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            logger_1.default.info(`Received request to get user with id: ${userId}`);
            if (!userId) {
                throw new BadRequestException_1.BadRequestException("User ID is required", { userId });
            }
            const user = yield this.userService.getUser(userId);
            if (!user) {
                throw new NotFoundException_1.NotFoundException("User not found", { userId });
            }
            res.status(200).json({ message: "User retrieved successfully", user: new User_Mapper_1.JSONMapper().reversemap(user) });
        });
    }
    // Get all users
    GetAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Received request to get all users');
            const users = yield this.userService.getAllUsers();
            const mappedUsers = users.map(user => new User_Mapper_1.JSONMapper().reversemap(user));
            res.status(200).json({
                message: "Users retrieved successfully",
                count: mappedUsers.length,
                users: mappedUsers
            });
        });
    }
    // Update user
    UpdateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            logger_1.default.info(`Received request to update user with id: ${userId}`);
            if (!userId) {
                throw new BadRequestException_1.BadRequestException("User ID is required", { userId });
            }
            // Create user object with the provided ID
            const userData = new User_Mapper_1.JSONMapper().map(req.body);
            userData.setId(userId);
            yield this.userService.updateUser(userData);
            res.status(200).json({
                message: "User updated successfully",
                user: new User_Mapper_1.JSONMapper().reversemap(userData)
            });
        });
    }
    // Delete user
    DeleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            logger_1.default.info(`Received request to delete user with id: ${userId}`);
            if (!userId) {
                throw new BadRequestException_1.BadRequestException("User ID is required", { userId });
            }
            yield this.userService.deleteUser(userId);
            res.status(200).json({ message: "User deleted successfully", userId });
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=User.controller.js.map