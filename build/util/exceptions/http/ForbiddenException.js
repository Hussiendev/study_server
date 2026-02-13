"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = void 0;
const HttpException_1 = require("./HttpException");
/**
 * ForbiddenException - 403 Status
 * Thrown when user is authenticated but not authorized to access resource
 */
class ForbiddenException extends HttpException_1.HttpException {
    constructor(message, details) {
        super(403, message, details);
        Object.setPrototypeOf(this, ForbiddenException.prototype);
    }
}
exports.ForbiddenException = ForbiddenException;
//# sourceMappingURL=ForbiddenException.js.map