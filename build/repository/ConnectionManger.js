"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const pg_1 = require("pg");
const config_1 = __importDefault(require("../config"));
const RepoException_1 = require("../util/exceptions/RepoException");
const logger_1 = __importDefault(require("../util/logger"));
class ConnectionManager {
    constructor() { }
    static getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // If pool exists → return a new client
                if (this.pool === null) {
                    this.pool = new pg_1.Pool({
                        connectionString: config_1.default.Storage.postgres, // e.g. neon connection URL
                        ssl: {
                            rejectUnauthorized: false
                        }
                    });
                    logger_1.default.info("PostgreSQL pool initialized (Neon)");
                }
                const client = yield this.pool.connect();
                logger_1.default.info("PostgreSQL connection established");
                return client;
            }
            catch (error) {
                logger_1.default.error("Failed to connect to PostgreSQL", error);
                throw new RepoException_1.DBException("Failed to connect to PostgreSQL", error);
            }
        });
    }
    static checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.getConnection();
                yield client.query("SELECT 1");
                client.release();
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.ConnectionManager = ConnectionManager;
ConnectionManager.pool = null;
//# sourceMappingURL=ConnectionManger.js.map