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
exports.UserRepo = exports.insert_query = exports.createUser = void 0;
exports.createUserRepo = createUserRepo;
const RepoException_1 = require("../util/exceptions/RepoException");
const logger_1 = __importDefault(require("../util/logger"));
const ConnectionManger_1 = require("./ConnectionManger");
const NotFoundException_1 = require("../util/exceptions/http/NotFoundException");
const IDgenerater_1 = require("../util/IDgenerater");
const User_Mapper_1 = require("../mapper/User.Mapper");
exports.createUser = `
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL ,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    reset_pass_token VARCHAR(255),
    reset_pass_expires_at TIMESTAMP,
    verfication_token VARCHAR(255),
    verfication_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
exports.insert_query = `
INSERT INTO "user" (id,name, email,password)
VALUES ($1, $2, $3,$4);
`;
const Get_User = 'SELECT * FROM "user" WHERE id = $1;';
const Get_All_Users = 'SELECT * FROM "user";';
const Update_User = 'UPDATE "user" SET name = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4;';
const Delete_User = 'DELETE FROM "user" WHERE id = $1;';
class UserRepo {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                yield connection.query(exports.createUser);
                logger_1.default.info("Orders table ensured in the database");
            }
            catch (error) {
                logger_1.default.error("Failed to initialize the repository", error);
                throw new RepoException_1.RepositoryInitializationException("Failed to initialize the repository", error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
    create(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            const id = (0, IDgenerater_1.idGenerater)('user');
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                connection.query('BEGIN TRANSACTION;');
                yield connection.query(exports.insert_query, [
                    id,
                    item.getName(),
                    item.getEmail(),
                    item.getPassword()
                ]);
                yield connection.query('COMMIT;');
                item.setId(id);
                logger_1.default.info(`User created successfully with email: ${item.getEmail()}`);
                return item.getId();
            }
            catch (error) {
                logger_1.default.error(error);
                if (connection) {
                    yield connection.query('ROLLBACK;');
                }
                throw new RepoException_1.DBException('ERROR during creation', error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                const target = yield connection.query(Get_User, [id]);
                const row = target.rows[0];
                if (!row) {
                    logger_1.default.error('user  not found');
                    throw new NotFoundException_1.NotFoundException(`User with id ${id} not found`, { userId: id });
                }
                return new User_Mapper_1.SQLMapper().map(row);
            }
            catch (error) {
                throw new RepoException_1.DBException('ERROR fetching the user of id   %o', error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
    getALL() {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                const result = yield connection.query(Get_All_Users);
                const rows = result.rows;
                if (!rows || rows.length === 0) {
                    logger_1.default.warn('No users found');
                    return [];
                }
                const mapper = new User_Mapper_1.SQLMapper();
                return rows.map(row => mapper.map(row));
            }
            catch (error) {
                logger_1.default.error('Error fetching all users', error);
                throw new RepoException_1.DBException('ERROR fetching all users', error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
    update(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                connection.query('BEGIN TRANSACTION;');
                const result = yield connection.query(Update_User, [
                    item.getName(),
                    item.getEmail(),
                    item.getPassword(),
                    item.getId()
                ]);
                if (result.rowCount === 0) {
                    logger_1.default.error(`User with id ${item.getId()} not found`);
                    throw new NotFoundException_1.NotFoundException(`User with id ${item.getId()} not found`, { userId: item.getId() });
                }
                yield connection.query('COMMIT;');
                logger_1.default.info(`User updated successfully with id: ${item.getId()}`);
            }
            catch (error) {
                logger_1.default.error(error);
                if (connection) {
                    yield connection.query('ROLLBACK;');
                }
                throw new RepoException_1.DBException('ERROR during update', error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield ConnectionManger_1.ConnectionManager.getConnection();
                connection.query('BEGIN TRANSACTION;');
                const result = yield connection.query(Delete_User, [id]);
                if (result.rowCount === 0) {
                    logger_1.default.error(`User with id ${id} not found`);
                    throw new NotFoundException_1.NotFoundException(`User with id ${id} not found`, { userId: id });
                }
                yield connection.query('COMMIT;');
                logger_1.default.info(`User deleted successfully with id: ${id}`);
            }
            catch (error) {
                logger_1.default.error(error);
                if (connection) {
                    yield connection.query('ROLLBACK;');
                }
                throw new RepoException_1.DBException('ERROR during delete', error);
            }
            finally {
                if (connection)
                    connection.release();
            }
        });
    }
}
exports.UserRepo = UserRepo;
function createUserRepo() {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = new UserRepo();
        yield repo.init();
        return repo;
    });
}
//# sourceMappingURL=User.repo.js.map