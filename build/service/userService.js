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
exports.UserService = void 0;
const User_repo_1 = require("../repository/User.repo");
const BadRequestException_1 = require("../util/exceptions/http/BadRequestException");
const NotFoundException_1 = require("../util/exceptions/http/NotFoundException");
const logger_1 = __importDefault(require("../util/logger"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../util/jwt");
const emailService_1 = require("../util/emailService");
class UserService {
    CreatUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Creating user with email: ${user.getEmail()}`);
            yield this.validateUser(user);
            yield (yield this.getRepo()).create(user);
            return user;
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Fetching user with id: ${id}`);
                const user = yield (yield this.getRepo()).get(id);
                return user;
            }
            catch (error) {
                logger_1.default.error(`Error fetching user with id ${id}`, error);
                throw error;
            }
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info('Fetching all users');
                const users = yield (yield this.getRepo()).getALL();
                return users;
            }
            catch (error) {
                logger_1.default.error('Error fetching all users', error);
                throw error;
            }
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Updating user with id: ${user.getId()}`);
                yield this.validateUser(user);
                yield (yield this.getRepo()).update(user);
            }
            catch (error) {
                logger_1.default.error(`Error updating user with id ${user.getId()}`, error);
                throw error;
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Deleting user with id: ${id}`);
                yield (yield this.getRepo()).delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error deleting user with id ${id}`, error);
                throw error;
            }
        });
    }
    /**
     * AUTHENTICATION METHODS
     */
    /**
     * Register a new user
     * 1. Validate user data
     * 2. Check if user already exists
     * 3. Hash password using bcrypt
     * 4. Create user with emailVerified = false
     * 5. Send verification email
     * 6. Return JWT token for future requests
     */
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Registering new user with email: ${user.getEmail()}`);
                // Validate user data
                this.validateUser(user);
                // Check if user already exists
                const existingUser = yield this.getUserByEmail(user.getEmail());
                if (existingUser) {
                    throw new BadRequestException_1.BadRequestException("User with this email already exists", { email: user.getEmail() });
                }
                // Hash password (10 salt rounds for security)
                const hashedPassword = yield bcrypt_1.default.hash(user.getPassword(), 10);
                user.setPassword(hashedPassword);
                user.emailVerified = false;
                // Create user
                yield (yield this.getRepo()).create(user);
                // Send verification email
                const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/verify/${user.getId()}`;
                yield (0, emailService_1.sendVerificationEmail)(user.getEmail(), verificationLink, user.getName());
                // Generate and return token
                const token = (0, jwt_1.generateToken)(user.getId(), user.getEmail());
                logger_1.default.info(`User registered successfully: ${user.getEmail()}`);
                return { token, user };
            }
            catch (error) {
                logger_1.default.error(`Error registering user`, error);
                throw error;
            }
        });
    }
    /**
     * Login user
     * 1. Find user by email
     * 2. Compare provided password with hashed password
     * 3. Generate and return JWT token
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Login attempt for email: ${email}`);
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new BadRequestException_1.BadRequestException("Invalid email format", { email });
                }
                // Find user by email
                const user = yield this.getUserByEmail(email);
                if (!user) {
                    throw new NotFoundException_1.NotFoundException("User not found with this email", { email });
                }
                // Compare passwords
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.getPassword());
                if (!isPasswordValid) {
                    throw new BadRequestException_1.BadRequestException("Invalid email or password", { email });
                }
                // Generate token
                const token = (0, jwt_1.generateToken)(user.getId(), user.getEmail());
                logger_1.default.info(`User logged in successfully: ${email}`);
                return { token, user };
            }
            catch (error) {
                logger_1.default.error(`Error logging in user: ${email}`, error);
                throw error;
            }
        });
    }
    /**
     * Verify user email
     * 1. Find user by ID
     * 2. Mark email as verified
     * 3. Update user in database
     */
    verifyEmail(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Verifying email for user: ${userId}`);
                // Get user
                const user = yield this.getUser(userId);
                if (!user) {
                    throw new NotFoundException_1.NotFoundException("User not found", { userId });
                }
                // Mark email as verified
                user.emailVerified = true;
                // Update user
                yield (yield this.getRepo()).update(user);
                // Send welcome email
                yield (0, emailService_1.sendWelcomeEmail)(user.getEmail(), user.getName());
                logger_1.default.info(`Email verified for user: ${user.getEmail()}`);
                return user;
            }
            catch (error) {
                logger_1.default.error(`Error verifying email for user: ${userId}`, error);
                throw error;
            }
        });
    }
    /**
     * Forgot password - sends reset link to user email
     * 1. Find user by email
     * 2. Generate reset token and set expiry (1 hour)
     * 3. Update user with reset token
     * 4. Send password reset email
     */
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Forgot password request for email: ${email}`);
                // Find user
                const user = yield this.getUserByEmail(email);
                if (!user) {
                    // For security, don't reveal if email exists
                    logger_1.default.warn(`Password reset requested for non-existent email: ${email}`);
                    return;
                }
                // Generate reset token
                const resetToken = (0, jwt_1.generateResetToken)();
                const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
                // Update user with reset token
                user.resetToken = resetToken;
                user.resetTokenExpiry = resetTokenExpiry;
                yield (yield this.getRepo()).update(user);
                // Send reset email
                const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
                yield (0, emailService_1.sendPasswordResetEmail)(user.getEmail(), resetLink, user.getName());
                logger_1.default.info(`Password reset email sent to: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error in forgot password process`, error);
                throw error;
            }
        });
    }
    /**
     * Reset password using reset token
     * 1. Find user by reset token
     * 2. Check if token is still valid (not expired)
     * 3. Hash new password
     * 4. Update user with new password and clear reset token
     */
    resetPassword(resetToken, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Resetting password with token`);
                // Get all users and find the one with matching reset token
                const users = yield (yield this.getRepo()).getALL();
                const user = users.find(u => u.resetToken === resetToken);
                if (!user) {
                    throw new NotFoundException_1.NotFoundException("Invalid reset token", { resetToken });
                }
                // Check if token is expired
                if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
                    throw new BadRequestException_1.BadRequestException("Reset token has expired. Please request a new one.", { resetToken });
                }
                // Validate new password
                if (!newPassword || newPassword.length < 6) {
                    throw new BadRequestException_1.BadRequestException("Password must be at least 6 characters long", {});
                }
                // Hash new password
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                // Update user
                user.setPassword(hashedPassword);
                user.resetToken = undefined;
                user.resetTokenExpiry = undefined;
                yield (yield this.getRepo()).update(user);
                logger_1.default.info(`Password reset successfully for user: ${user.getEmail()}`);
                return user;
            }
            catch (error) {
                logger_1.default.error(`Error resetting password`, error);
                throw error;
            }
        });
    }
    /**
     * Get user by email
     * Helper method to find user by email address
     */
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield (yield this.getRepo()).getALL();
                return users.find(u => u.getEmail() === email) || null;
            }
            catch (error) {
                logger_1.default.error(`Error fetching user by email: ${email}`, error);
                throw error;
            }
        });
    }
    validateUser(user) {
        const email = user.getEmail();
        const name = user.getName();
        const password = user.getPassword();
        logger_1.default.info(`Validating user with email: ${email}`);
        if (!name || !email || !password) {
            const details = {
                NameNotDefined: !name,
                EmailNotDefined: !email,
                PasswordNotDefined: !password
            };
            throw new BadRequestException_1.BadRequestException("Invalid user: name, email, and password must be valid.", details);
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException_1.BadRequestException("Invalid email format.", { email });
        }
        // Password validation (at least 6 characters)
        if (password.length < 6) {
            throw new BadRequestException_1.BadRequestException("Password must be at least 6 characters long.", { password });
        }
    }
    getRepo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.userRepo) {
                this.userRepo = yield (0, User_repo_1.createUserRepo)();
            }
            return this.userRepo;
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map