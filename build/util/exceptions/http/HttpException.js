"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
// After: HttpException base class
class HttpException extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.message = message;
        this.details = details;
        this.name = "HttpException";
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=HttpException.js.map