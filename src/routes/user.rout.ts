import { UserController } from "../controller/User.controller";
import { Router } from "express";


import { UserService } from "../service/userService";
import { asyncHandler } from "../midlleware/asynchandler";
import { authenticate } from "../midlleware/auth";
import { hasPermission } from "../midlleware/autharize";
import { PERMISSION } from "../config/roles";

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// Create user
router.route('/')
    .post(asyncHandler(userController.createUser.bind(userController)))
    .get(authenticate,hasPermission(PERMISSION.READ_ALL_USERS),asyncHandler(userController.getAllUsers.bind(userController)));

// Get, update, delete user by ID
router.route('/:id')
    .get(authenticate,hasPermission(PERMISSION.READ_USER),asyncHandler(userController.getUser.bind(userController)))
    .put(authenticate,hasPermission(PERMISSION.UPDATE_USER),asyncHandler(userController.updateUser.bind(userController)))
    .delete(authenticate,hasPermission(PERMISSION.DELETE_USER),asyncHandler(userController.deleteUser.bind(userController)));

export default router;