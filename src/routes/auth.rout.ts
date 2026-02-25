
import { Router } from "express";

import { asyncHandler } from "../midlleware/asynchandler";
import { AuthenticationServiceSingleton } from "../service/AuthenticationServiceSingleton";

import { AuthController } from "../controller/AuthController";
import { UserService } from "../service/userService";
import { authenticate } from "../midlleware/auth";
import { hasPermission } from "../midlleware/autharize";
import { PERMISSION } from "../config/roles";
import { EmailService } from "../service/Emailservice"
const router = Router();
const authService= AuthenticationServiceSingleton.getInstance();
const userService= new UserService();
const emailService=new EmailService();
const authController = new AuthController(authService,userService,emailService);


// Define your routes here
router.post('/login',asyncHandler(authController.login.bind(authController)));
router.post("/forgot-password",authenticate,hasPermission(PERMISSION.Forget_PASS),asyncHandler(authController.forgetpass.bind(authController)));
router.put("/update-pass",authenticate,hasPermission(PERMISSION.Forget_PASS),asyncHandler(authController.updatePass.bind(authController)));
router.get(
  '/logout',
  authenticate,
  hasPermission(PERMISSION.Update_PAsss),
  asyncHandler(authController.logout.bind(authController))
);
export default router;