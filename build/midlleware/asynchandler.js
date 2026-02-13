"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
//“Take an async function, run it, and if it fails, forward the error to Express.”
// Wraps an async function and catches any rejected promises, passing the error to next()
const asyncHandler = (fn) => {
    return (req, res, next) => fn(req, res).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=asynchandler.js.map