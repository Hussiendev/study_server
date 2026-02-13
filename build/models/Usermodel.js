"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, password, createdAt, // optional, use DB date if exists
    emailVerified = false, resetToken, resetTokenExpiry) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.emailVerified = emailVerified;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
        this.createdAt = createdAt || new Date();
    }
    // Getters
    getId() {
        return this.id;
    }
    getEmail() {
        return this.email;
    }
    getName() {
        return this.name;
    }
    getPassword() {
        return this.password;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    // Setters
    setId(id) {
        this.id = id;
    }
    setEmail(email) {
        this.email = email;
    }
    setName(name) {
        this.name = name;
    }
    setPassword(password) {
        this.password = password;
    }
    setCreatedAt(date) {
        this.createdAt = date;
    }
}
exports.User = User;
//# sourceMappingURL=Usermodel.js.map