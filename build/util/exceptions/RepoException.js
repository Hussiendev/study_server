"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBException = exports.RepositoryInitializationException = exports.InvalidItemException = exports.ItemNotFoundException = void 0;
class ItemNotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = "ItemNotFoundException";
    }
}
exports.ItemNotFoundException = ItemNotFoundException;
class InvalidItemException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidItemException";
    }
}
exports.InvalidItemException = InvalidItemException;
class RepositoryInitializationException extends Error {
    constructor(message, error) {
        super(message);
        this.name = "RepositoryInitializationException";
        this.stack = error.stack;
        this.message = `${message}: ${error.message}`;
    }
}
exports.RepositoryInitializationException = RepositoryInitializationException;
class DBException extends Error {
    constructor(message, error) {
        super(message);
        this.name = "DBException";
        this.stack = error.stack;
        this.message = `${message}: ${error.message}`;
    }
}
exports.DBException = DBException;
//# sourceMappingURL=RepoException.js.map