"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_rout_1 = __importDefault(require("./user.rout"));
const auth_rout_1 = __importDefault(require("./auth.rout"));
const router = (0, express_1.Router)();
// Define your routes here
router.use('/auth', auth_rout_1.default);
router.use('/users', user_rout_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map