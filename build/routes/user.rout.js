"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_controller_1 = require("../controller/User.controller");
const express_1 = require("express");
const userService_1 = require("../service/userService");
const asynchandler_1 = require("../midlleware/asynchandler");
const router = (0, express_1.Router)();
const userService = new userService_1.UserService();
const userController = new User_controller_1.UserController(userService);
// Create user
router.route('/')
    .post((0, asynchandler_1.asyncHandler)(userController.CreateUser.bind(userController)))
    .get((0, asynchandler_1.asyncHandler)(userController.GetAllUsers.bind(userController)));
// Get, update, delete user by ID
router.route('/:id')
    .get((0, asynchandler_1.asyncHandler)(userController.GetUser.bind(userController)))
    .put((0, asynchandler_1.asyncHandler)(userController.UpdateUser.bind(userController)))
    .delete((0, asynchandler_1.asyncHandler)(userController.DeleteUser.bind(userController)));
exports.default = router;
//# sourceMappingURL=user.rout.js.map