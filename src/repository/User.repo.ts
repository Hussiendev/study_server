import { User } from "models/Usermodel";
import { id, ID, Intiazable, IRepository } from "./IRepo";
import { DBException, RepositoryInitializationException } from "util/exceptions/RepoException";
import logger from "util/logger";
import { ConnectionManager } from "./ConnectionManger";
import { error } from "winston";

export const createUser = `
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
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

export const insert_query = `
INSERT INTO "user" (email, name, password)
VALUES ($1, $2, $3);
`;
const Get_User='SELECT * FROM "user" WHERE id = $1;';
export class UserRepo implements IRepository<User>, Intiazable {
    async init(): Promise<void> {
            let connection;
        try{
         connection= await ConnectionManager.getConnection();
       await  connection.query( createUser);
  
       logger.info("Orders table ensured in the database");
    }
    catch(error:unknown){
        logger.error("Failed to initialize the repository", error as Error);
        throw new  RepositoryInitializationException("Failed to initialize the repository", error as Error);
    }
    finally{
         if (connection) connection.release(); 
    }
    }




    async create(item: User): Promise<id> {
            let connection;
        try{
                connection= await ConnectionManager.getConnection();
                  connection.query('BEGIN TRANSACTION;');
                
             await connection.query(insert_query, [
                    item.getEmail(),
                    item.getName(),
                    item.getPassword()
                ]);
                
                await connection.query('COMMIT;');

                logger.info(`User created successfully with email: ${item.getEmail()}`);
                return item.getId();
        }
        catch(error){
                    logger.error(error);
                    if(connection) {
                        await connection.query('ROLLBACK;');
                    }
                    throw new DBException('ERROR during creation',error as Error);
        }
        finally{
                  if (connection) connection.release();   
        }
    }
 async get(id: id): Promise<User> {
        let connection;
        try{
                connection= await ConnectionManager.getConnection();
                const target=await connection.query(Get_User,[id]);
                if(!target){
                           logger.error('user  not found');
                throw new Error("user of id "+id+'is not found');
                }
             return new User(
                target.rows[0].id,
                target.rows[0].email,
                target.rows[0].name,
                target.rows[0].password,
                target.rows[0].created_at,
             );
        }
        catch(error){
               throw new DBException('ERROR fetching the user of id   %o',error as Error);
        }
        finally{
                  if (connection) connection.release();   
        }
    }
    getALL(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    update(item: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: id): Promise<void> {
        throw new Error("Method not implemented.");
    }
}