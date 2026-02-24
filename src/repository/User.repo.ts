import { User } from "../models/Usermodel";
import { id,  Intiazable, IRepository } from "./IRepo";
import { DBException, RepositoryInitializationException } from "../util/exceptions/RepoException";
import logger from "../util/logger";
import { ConnectionManager } from "./ConnectionManger";
import { NotFoundException } from "../util/exceptions/http/NotFoundException";

import { idGenerater } from "../util/IDgenerater";
import { SQLMapper, SQLUser } from "../mapper/User.Mapper";
import { ROLE } from "../config/roles";

export const createUser = `
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL ,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
   reset_token TEXT,
reset_token_expiration TIMESTAMP,
    refresh_token VARCHAR(255),
    refresh_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const insert_query = `
INSERT INTO "user" (id,name, email,password,role)
VALUES ($1, $2, $3,$4,$5);
`;
const addRoleColumn = `
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '${ROLE.USER}';
`;
const Get_User='SELECT * FROM "user" WHERE id = $1;';
const Get_All_Users='SELECT * FROM "user";';
const Update_User='UPDATE "user" SET name = $1, email = $2, password = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5;';
const Delete_User='DELETE FROM "user" WHERE id = $1;';
const Get_User_By_Email='SELECT * FROM "user" WHERE email = $1;';
const Update_Refresh_Token =
'UPDATE "user" SET refresh_token=$1,    refresh_token_expires_at=$2 WHERE id=$3;';
const Update_VeerfyEmail='UPDATE "user" SET is_verified =$1, last_login=CURRENT_TIMESTAMP WHERE email=$2;'
const Update_logout='UPDATE "user" SET is_verified =$1  WHERE id=$2;'

export class UserRepo implements IRepository<User>, Intiazable {

    async init(): Promise<void> {
        let connection;
        try {
            connection = await ConnectionManager.getConnection();
            await connection.query(createUser);
            await connection.query(addRoleColumn);
            logger.info("User table ensured in the database");
        } catch (error) {
            logger.error("Failed to initialize repository", error as Error);
            throw new RepositoryInitializationException(
                "Failed to initialize repository",
                error as Error
            );
        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // CREATE
    // -------------------------
    async create(item: User): Promise<id> {
        let connection;
        const generatedId = idGenerater("user");

        try {
            connection = await ConnectionManager.getConnection();
            await connection.query("BEGIN");

            await connection.query(insert_query, [
                generatedId,
                item.getName(),
                item.getEmail(),
                item.getPassword(),
                item.getRole()
            ]);

            await connection.query("COMMIT");

            item.setId(generatedId);
            logger.info(`User created successfully: ${generatedId}`);
            return generatedId;

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            logger.error("DB error during create", error as Error);
            throw new DBException("Error creating user", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET BY ID
    // -------------------------
    async get(id: id): Promise<User> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLUser>(Get_User, [id]);

            const row = result.rows[0];
            if (!row) {
                throw new NotFoundException(
                    `User with id ${id} not found`,
                    { userId: id }
                );
            }
           


            return new SQLMapper().map(row);

        } catch (error) {

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error fetching user", error as Error);
            throw new DBException("Error fetching user", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET BY EMAIL
    // -------------------------
    async getsUserbyEmail(email: string): Promise<User> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLUser>(Get_User_By_Email, [email]);

            const row = result.rows[0];
            if (!row) {
                throw new NotFoundException(
                    `User with email ${email} not found`,
                    { email }
                );
            }
        

            return new SQLMapper().map(row);

        } catch (error) {

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error fetching user by email", error as Error);
            throw new DBException("Error fetching user by email", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET ALL
    // -------------------------
    async getALL(): Promise<User[]> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLUser>(Get_All_Users);

            if (!result.rows.length) {
                return [];
            }

            const mapper = new SQLMapper();
            return result.rows.map(row => mapper.map(row));

        } catch (error) {
            logger.error("DB error fetching all users", error as Error);
            throw new DBException("Error fetching users", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // UPDATE
    // -------------------------
    async update(item: User): Promise<void> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            await connection.query("BEGIN");

            const result = await connection.query(Update_User, [
                item.getName(),
                item.getEmail(),
                item.getPassword(),
                item.getRole(),
                item.getId()
            ]);

            if (result.rowCount === 0) {
                throw new NotFoundException(
                    `User with id ${item.getId()} not found`,
                    { userId: item.getId() }
                );
            }

            await connection.query("COMMIT");
            logger.info(`User updated: ${item.getId()}`);

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error during update", error as Error);
            throw new DBException("Error updating user", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // DELETE
    // -------------------------
    async delete(id: id): Promise<void> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            await connection.query("BEGIN");

            const result = await connection.query(Delete_User, [id]);

            if (result.rowCount === 0) {
                throw new NotFoundException(
                    `User with id ${id} not found`,
                    { userId: id }
                );
            }

            await connection.query("COMMIT");
            logger.info(`User deleted: ${id}`);

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error during delete", error as Error);
            throw new DBException("Error deleting user", error as Error);

        } finally {
            connection?.release();
        }
    }
    async updateRefreshToken(userId: string, token: string | null,expired:Date|null): Promise<void> {
    const connection = await ConnectionManager.getConnection();
    try {
        await connection.query(Update_Refresh_Token, [token, expired,userId]);
    } finally {
        connection.release();
    }
}
async Update_USER_VERF(email:string):Promise<void>{
    const connection = await ConnectionManager.getConnection();
    try {
        await connection.query(Update_VeerfyEmail, [true, email]);
    } finally {
        connection.release();
    }

}
async Logout(userId:string):Promise<void>{
     const connection = await ConnectionManager.getConnection();
try {
        await connection.query(Update_logout, [false, userId]);
    } finally {
        connection.release();
    }

}
async updateResetToken(userId: string, token: string, expiration: Date) {
    const connection = await ConnectionManager.getConnection();
    try {
        await connection.query(
            `UPDATE "user" 
             SET reset_token=$1, reset_token_expiration=$2 
             WHERE id=$3`,
            [token, expiration, userId]
        );
    } finally {
        connection.release();
    }
}

async clearResetToken(email: string): Promise<void> {
    const connection = await ConnectionManager.getConnection();
    try {
        await connection.query(
            `UPDATE "user" 
             SET reset_token = NULL, reset_token_expiration = NULL 
             WHERE email = $1`,
            [email]
        );
    } finally {
        connection.release();
    }
}
// In User.repo.ts - ADD THIS METHOD
async getResetDataByEmail(email: string): Promise<{ 
    hashedToken: string; 
    expiresAt: Date 
} | null> {
    const connection = await ConnectionManager.getConnection();
    try {
        const result = await connection.query(
            `SELECT reset_token, reset_token_expiration 
             FROM "user" 
             WHERE email = $1`,
            [email]
        );
        
        if (result.rows.length === 0 || !result.rows[0].reset_token) {
            return null;
        }
        
        return {
            hashedToken: result.rows[0].reset_token,
            expiresAt: new Date(result.rows[0].reset_token_expiration)
        };
    } finally {
        connection.release();
    }
}

async updatePassword(email: string, newPassword: string) {
    const connection = await ConnectionManager.getConnection();
    try {
        await connection.query(
            `UPDATE "user" 
             SET password=$1, reset_token=NULL, reset_token_expiration=NULL 
             WHERE email=$2`,
            [newPassword, email]
        );
    } finally {
        connection.release();
    }
}

}


 export async function createUserRepo(): Promise<UserRepo> {
    const repo = new UserRepo();
    await repo.init();
    return repo;
    }