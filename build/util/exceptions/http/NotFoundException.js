"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const HttpException_1 = require("./HttpException");
// After: NotFoundException
class NotFoundException extends HttpException_1.HttpException {
    constructor(message = "Resource Not Found", details) {
        super(404, message, details);
        this.name = "NotFoundException";
    }
}
exports.NotFoundException = NotFoundException;
//# sourceMappingURL=NotFoundException.js.map