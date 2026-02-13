
import { Router } from "express";

import { asyncHandler } from "../midlleware/asynchandler";
import { AuthenticationServiceSingleton } from "../service/AuthenticationServiceSingleton";

import { AuthController } from "../controller/AuthController";
import { UserService } from "../service/userService";
import { authenticate } from "../midlleware/auth";
const router = Router();
const authService= AuthenticationServiceSingleton.getInstance();
const userService= new UserService();
const authController = new AuthController(authService,userService);


// Define your routes here
router.route('/login')
  .post(asyncHandler(authController.login.bind(authController)))
  
router.route('/logout')
  .get(authenticate,asyncHandler(authController.logout.bind(authController)));
export default router;
