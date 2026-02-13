"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONMapper = exports.SQLMapper = void 0;
const User_builder_1 = require("../builder/User.builder");
const IDgenerater_1 = require("../util/IDgenerater");
const logger_1 = __importDefault(require("../util/logger"));
class SQLMapper {
    map(input) {
        return User_builder_1.UserBuilder.createBuilder()
            .setId(input.id)
            .setName(input.name)
            .setEmail(input.email)
            .setPassword(input.password)
            .build();
    }
    reversemap(input) {
        return {
            id: input.getId(),
            name: input.getName(),
            email: input.getEmail(),
            password: input.getPassword(),
            createdAt: input.getCreatedAt()
        };
    }
}
exports.SQLMapper = SQLMapper;
class JSONMapper {
    map(input) {
        logger_1.default.info(`Mapping JSON to User: ${JSON.stringify(input)}`);
        return User_builder_1.UserBuilder.createBuilder()
            .setId((0, IDgenerater_1.idGenerater)("user"))
            .setName(input.name)
            .setEmail(input.email)
            .setPassword(input.password)
            .build();
    }
    reversemap(input) {
        return {
            name: input.getName(),
            email: input.getEmail(),
            password: input.getPassword(),
        };
    }
}
exports.JSONMapper = JSONMapper;
//# sourceMappingURL=User.Mapper.js.map