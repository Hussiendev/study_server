"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.extractToken = extractToken;
exports.generateResetToken = generateResetToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
/**
 * Generate JWT Token
 * @param userId - User ID to encode in the token
 * @param email - User email to encode in the token
 * @returns JWT token string
 */
function generateToken(userId, email) {
    try {
        const token = jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        logger_1.default.info(`JWT token generated for user: ${email}`);
        return token;
    }
    catch (error) {
        logger_1.default.error('Error generating JWT token', error);
        throw new Error('Failed to generate authentication token');
    }
}
/**
 * Verify JWT Token
 * @param token - JWT token to verify
 * @returns Decoded token payload with userId and email
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        logger_1.default.info(`JWT token verified for user: ${decoded.email}`);
        return decoded;
    }
    catch (error) {
        logger_1.default.error('Error verifying JWT token', error);
        throw new Error('Invalid or expired token');
    }
}
/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer token123")
 * @returns Token string without "Bearer " prefix
 */
function extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }
    return authHeader.substring(7); // Remove "Bearer " prefix
}
/**
 * Generate a random reset token for password reset functionality
 * @returns Random token string
 */
function generateResetToken() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
//# sourceMappingURL=jwt.js.map