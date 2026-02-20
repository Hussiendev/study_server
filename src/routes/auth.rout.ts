
import { Router } from "express";

import { asyncHandler } from "../midlleware/asynchandler";
import { AuthenticationServiceSingleton } from "../service/AuthenticationServiceSingleton";

import { AuthController } from "../controller/AuthController";
import { UserService } from "../service/userService";
import { authenticate } from "../midlleware/auth";
import { hasPermission } from "../midlleware/autharize";
import { PERMISSION } from "../config/roles";
const router = Router();
const authService= AuthenticationServiceSingleton.getInstance();
const userService= new UserService();
const authController = new AuthController(authService,userService);


// Define your routes here
router.post(
  '/login',
  asyncHandler(authController.login.bind(authController))
);

router.get(
  '/logout',
  authenticate,
  hasPermission(PERMISSION.LOGOUT),
  asyncHandler(authController.logout.bind(authController))
);
export default router;