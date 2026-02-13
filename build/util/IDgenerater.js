"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = exports.idGenerater = void 0;
const uuid_1 = require("uuid");
const idGenerater = (prefix) => {
    return prefix ? `${prefix}-${(0, uuid_1.v4)()}` : (0, uuid_1.v4)();
};
exports.idGenerater = idGenerater;
const generateUniqueId = (prefix) => {
    return (0, exports.idGenerater)(prefix);
};
exports.generateUniqueId = generateUniqueId;
//# sourceMappingURL=IDgenerater.js.map