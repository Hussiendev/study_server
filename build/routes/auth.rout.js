"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_controller_1 = require("../controller/Auth.controller");
const userService_1 = require("../service/userService");
const asynchandler_1 = require("../midlleware/asynchandler");
const auth_1 = require("../midlleware/auth");
const router = (0, express_1.Router)();
const userService = new userService_1.UserService();
const authController = new Auth_controller_1.AuthController(userService);
/**
 * AUTHENTICATION ROUTES
 * Base URL: /auth
 */
/**
 * POST /auth/register
 * Register a new user
 * Body: { name, email, password, confirmPassword }
 */
router.post('/register', (0, asynchandler_1.asyncHandler)(authController.register.bind(authController)));
/**
 * POST /auth/login
 * Login with email and password
 * Body: { email, password }
 * Returns JWT token
 */
router.post('/login', (0, asynchandler_1.asyncHandler)(authController.login.bind(authController)));
/**
 * POST /auth/verify/:userId
 * Verify user email
 * This endpoint is called when user clicks verification link in email
 */
router.post('/verify/:userId', (0, asynchandler_1.asyncHandler)(authController.verifyEmail.bind(authController)));
/**
 * POST /auth/forgot-password
 * Request password reset email
 * Body: { email }
 */
router.post('/forgot-password', (0, asynchandler_1.asyncHandler)(authController.forgotPassword.bind(authController)));
/**
 * POST /auth/reset-password/:resetToken
 * Reset password using token from email
 * Params: resetToken (from email link)
 * Body: { password, confirmPassword }
 */
router.post('/reset-password/:resetToken', (0, asynchandler_1.asyncHandler)(authController.resetPassword.bind(authController)));
/**
 * GET /auth/me
 * Get current user profile (Protected route)
 * Requires: JWT token in Authorization header
 * Header: Authorization: Bearer <token>
 */
router.get('/me', auth_1.authenticate, (0, asynchandler_1.asyncHandler)(authController.getCurrentUser.bind(authController)));
exports.default = router;
//# sourceMappingURL=auth.rout.js.map