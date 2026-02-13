"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBuilder = void 0;
const logger_1 = __importDefault(require("../util/logger"));
const Usermodel_1 = require("../models/Usermodel");
class UserBuilder {
    static createBuilder() {
        return new UserBuilder();
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setEmail(email) {
        this.email = email;
        logger_1.default.info(`Setting email in UserBuilder: ${email}`);
        return this;
    }
    setPassword(password) {
        this.password = password;
        return this;
    }
    build() {
        const required = [this.id, this.name, this.email, this.password];
        for (const field of required) {
            if (field === undefined) {
                throw new Error("Missing required fields to build User");
            }
        }
        return new Usermodel_1.User(this.id, this.name, this.email, this.password);
    }
}
exports.UserBuilder = UserBuilder;
//# sourceMappingURL=User.builder.js.map