"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../util/jwt");
const UnauthorizedException_1 = require("../util/exceptions/http/UnauthorizedException");
const logger_1 = __importDefault(require("../util/logger"));
/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and adds user info to request
 *
 * How it works:
 * 1. Extract Authorization header
 * 2. Extract token from "Bearer <token>" format
 * 3. Verify token using JWT secret
 * 4. Add userId and userEmail to request object
 * 5. Allow request to proceed to next middleware/route
 *
 * Usage in routes:
 * router.get('/protected', authenticate, controllerMethod)
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger_1.default.warn('Missing Authorization header');
            throw new UnauthorizedException_1.UnauthorizedException('Missing Authorization header. Please provide a token.', {
                header: 'Authorization'
            });
        }
        const token = (0, jwt_1.extractToken)(authHeader);
        const decoded = (0, jwt_1.verifyToken)(token);
        // Attach user info to request for use in controllers
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        logger_1.default.info(`User authenticated: ${decoded.email}`);
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error', error);
        if (error instanceof UnauthorizedException_1.UnauthorizedException) {
            throw error;
        }
        throw new UnauthorizedException_1.UnauthorizedException('Invalid or expired token. Please login again.', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=auth.js.map