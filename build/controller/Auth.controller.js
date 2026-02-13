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
exports.AuthController = void 0;
const User_Mapper_1 = require("../mapper/User.Mapper");
const Usermodel_1 = require("../models/Usermodel");
const BadRequestException_1 = require("../util/exceptions/http/BadRequestException");
const logger_1 = __importDefault(require("../util/logger"));
const IDgenerater_1 = require("../util/IDgenerater");
/**
 * Authentication Controller
 * Handles all authentication-related endpoints
 */
class AuthController {
    constructor(userService) {
        this.userService = userService;
    }
    /**
     * REGISTER ENDPOINT
     * POST /auth/register
     *
     * Request body:
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "password123"
     * }
     *
     * Response:
     * {
     *   "message": "User registered successfully",
     *   "token": "jwt-token-here",
     *   "user": { ...user data }
     * }
     *
     * What happens:
     * 1. Validate input data (name, email, password)
     * 2. Check password strength (min 6 characters)
     * 3. Create new User object with unique ID
     * 4. Call userService.register() which:
     *    - Checks if email already exists
     *    - Hashes the password using bcrypt
     *    - Saves user with emailVerified = false
     *    - Sends verification email
     *    - Returns JWT token
     */
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, confirmPassword } = req.body;
                logger_1.default.info(`Registration attempt for email: ${email}`);
                // Validate required fields
                if (!name || !email || !password || !confirmPassword) {
                    throw new BadRequestException_1.BadRequestException('Name, email, password, and confirm password are required', {
                        nameProvided: !!name,
                        emailProvided: !!email,
                        passwordProvided: !!password,
                        confirmPasswordProvided: !!confirmPassword
                    });
                }
                // Check password match
                if (password !== confirmPassword) {
                    throw new BadRequestException_1.BadRequestException('Passwords do not match', {});
                }
                // Create user object
                const userId = (0, IDgenerater_1.generateUniqueId)();
                const user = new Usermodel_1.User(userId, name, email, password);
                // Register user
                const { token, user: registeredUser } = yield this.userService.register(user);
                res.status(201).json({
                    message: 'User registered successfully. Please verify your email.',
                    token,
                    user: new User_Mapper_1.JSONMapper().reversemap(registeredUser)
                });
            }
            catch (error) {
                logger_1.default.error('Error in register endpoint', error);
                throw error;
            }
        });
    }
    /**
     * LOGIN ENDPOINT
     * POST /auth/login
     *
     * Request body:
     * {
     *   "email": "john@example.com",
     *   "password": "password123"
     * }
     *
     * Response:
     * {
     *   "message": "Login successful",
     *   "token": "jwt-token-here",
     *   "user": { ...user data }
     * }
     *
     * What happens:
     * 1. Validate email and password provided
     * 2. Call userService.login() which:
     *    - Finds user by email
     *    - Compares password using bcrypt
     *    - Returns JWT token if credentials are valid
     * 3. Return token for authenticated requests
     */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                logger_1.default.info(`Login attempt for email: ${email}`);
                // Validate required fields
                if (!email || !password) {
                    throw new BadRequestException_1.BadRequestException('Email and password are required', {
                        emailProvided: !!email,
                        passwordProvided: !!password
                    });
                }
                // Login user
                const { token, user } = yield this.userService.login(email, password);
                res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: new User_Mapper_1.JSONMapper().reversemap(user)
                });
            }
            catch (error) {
                logger_1.default.error('Error in login endpoint', error);
                throw error;
            }
        });
    }
    /**
     * VERIFY EMAIL ENDPOINT
     * POST /auth/verify/:userId
     *
     * URL params:
     * - userId: The ID of the user to verify
     *
     * What happens:
     * 1. Get userId from URL parameters
     * 2. Call userService.verifyEmail() which:
     *    - Finds user by ID
     *    - Sets emailVerified = true
     *    - Saves updated user
     *    - Sends welcome email
     * 3. Return success message
     *
     * Note: This endpoint is called when user clicks verification link in email
     */
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                logger_1.default.info(`Email verification request for user: ${userId}`);
                if (!userId) {
                    throw new BadRequestException_1.BadRequestException('User ID is required', { userId });
                }
                // Verify email
                const user = yield this.userService.verifyEmail(userId);
                res.status(200).json({
                    message: 'Email verified successfully',
                    user: new User_Mapper_1.JSONMapper().reversemap(user)
                });
            }
            catch (error) {
                logger_1.default.error('Error in verify email endpoint', error);
                throw error;
            }
        });
    }
    /**
     * FORGOT PASSWORD ENDPOINT
     * POST /auth/forgot-password
     *
     * Request body:
     * {
     *   "email": "john@example.com"
     * }
     *
     * Response:
     * {
     *   "message": "Password reset link sent to your email"
     * }
     *
     * What happens:
     * 1. Validate email provided
     * 2. Call userService.forgotPassword() which:
     *    - Finds user by email
     *    - Generates random reset token
     *    - Sets token expiry to 1 hour
     *    - Saves token in database
     *    - Sends email with reset link
     * 3. Return success message (doesn't reveal if email exists for security)
     *
     * Note: For security reasons, we don't reveal if email exists or not
     */
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                logger_1.default.info(`Forgot password request for email: ${email}`);
                if (!email) {
                    throw new BadRequestException_1.BadRequestException('Email is required', { emailProvided: !!email });
                }
                // Process forgot password
                yield this.userService.forgotPassword(email);
                res.status(200).json({
                    message: 'If this email exists in our system, you will receive a password reset link shortly'
                });
            }
            catch (error) {
                logger_1.default.error('Error in forgot password endpoint', error);
                throw error;
            }
        });
    }
    /**
     * RESET PASSWORD ENDPOINT
     * POST /auth/reset-password/:resetToken
     *
     * URL params:
     * - resetToken: Token sent in forgot password email
     *
     * Request body:
     * {
     *   "password": "newpassword123",
     *   "confirmPassword": "newpassword123"
     * }
     *
     * Response:
     * {
     *   "message": "Password reset successfully",
     *   "user": { ...user data }
     * }
     *
     * What happens:
     * 1. Get resetToken from URL
     * 2. Validate new password provided
     * 3. Check passwords match
     * 4. Call userService.resetPassword() which:
     *    - Finds user with matching reset token
     *    - Checks if token hasn't expired (valid for 1 hour)
     *    - Hashes new password
     *    - Updates user password
     *    - Clears reset token
     * 5. Return success message
     *
     * Note: This endpoint is called when user clicks reset link in email
     */
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { resetToken } = req.params;
                const { password, confirmPassword } = req.body;
                logger_1.default.info(`Password reset request with token`);
                // Validate inputs
                if (!resetToken) {
                    throw new BadRequestException_1.BadRequestException('Reset token is required', { resetTokenProvided: !!resetToken });
                }
                if (!password || !confirmPassword) {
                    throw new BadRequestException_1.BadRequestException('Password and confirm password are required', {
                        passwordProvided: !!password,
                        confirmPasswordProvided: !!confirmPassword
                    });
                }
                if (password !== confirmPassword) {
                    throw new BadRequestException_1.BadRequestException('Passwords do not match', {});
                }
                // Reset password
                const user = yield this.userService.resetPassword(resetToken, password);
                res.status(200).json({
                    message: 'Password reset successfully',
                    user: new User_Mapper_1.JSONMapper().reversemap(user)
                });
            }
            catch (error) {
                logger_1.default.error('Error in reset password endpoint', error);
                throw error;
            }
        });
    }
    /**
     * GET CURRENT USER ENDPOINT
     * GET /auth/me
     * Protected route - requires valid JWT token
     *
     * Response:
     * {
     *   "message": "User profile retrieved",
     *   "user": { ...user data }
     * }
     *
     * What happens:
     * 1. authenticate middleware extracts userId from JWT token
     * 2. Fetch user from database using userId
     * 3. Return user data
     *
     * Usage: After login, client can call this endpoint to get current user profile
     */
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                logger_1.default.info(`Fetching current user profile: ${userId}`);
                if (!userId) {
                    throw new BadRequestException_1.BadRequestException('User ID not found in token', {});
                }
                // Get user
                const user = yield this.userService.getUser(userId);
                res.status(200).json({
                    message: 'User profile retrieved',
                    user: new User_Mapper_1.JSONMapper().reversemap(user)
                });
            }
            catch (error) {
                logger_1.default.error('Error in get current user endpoint', error);
                throw error;
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=Auth.controller.js.map