import { UserController } from "../controller/User.controller";
import { Router } from "express";


import { UserService } from "../service/userService";
import { asyncHandler } from "../midlleware/asynchandler";
import { authenticate } from "../midlleware/auth";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// Create user
router.route('/')
    .post(asyncHandler(userController.createUser.bind(userController)))
    .get(authenticate,asyncHandler(userController.getAllUsers.bind(userController)));

// Get, update, delete user by ID
router.route('/:id')
    .get(authenticate,asyncHandler(userController.getUser.bind(userController)))
    .put(authenticate,asyncHandler(userController.updateUser.bind(userController)))
    .delete(authenticate,asyncHandler(userController.deleteUser.bind(userController)));

export default router;