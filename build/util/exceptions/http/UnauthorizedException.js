"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = void 0;
const HttpException_1 = require("./HttpException");
/**
 * UnauthorizedException - 401 Status
 * Thrown when authentication fails or token is invalid
 */
class UnauthorizedException extends HttpException_1.HttpException {
    constructor(message, details) {
        super(401, message, details);
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
}
exports.UnauthorizedException = UnauthorizedException;
//# sourceMappingURL=UnauthorizedException.js.map