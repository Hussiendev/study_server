"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceException = void 0;
class ServiceException extends Error {
    constructor(message, error) {
        super(message);
        this.name = "ServiceException";
        if (error) {
            this.stack = error.stack;
            this.message = `${message}: ${error.message}`;
        }
    }
}
exports.ServiceException = ServiceException;
//# sourceMappingURL=ServiceExceptions.js.map