import { Pool, PoolClient } from "pg"
import config from "../config";
import { DBException } from "../util/exceptions/RepoException";
import logger from "../util/logger";

export class ConnectionManager {
    private static pool: Pool | null = null;

    private constructor() {}

    public static async getConnection(): Promise<PoolClient> {
        try {
            // If pool exists → return a new client
            if (this.pool === null) {
                this.pool = new Pool({
                    connectionString: config.Storage.postgres, // e.g. neon connection URL
                    ssl: {
                        rejectUnauthorized: false
                    }
                });

                logger.info("PostgreSQL pool initialized (Neon)");
            }

            const client = await this.pool.connect();
            logger.info("PostgreSQL connection established");

            return client;

        } catch (error) {
            logger.error("Failed to connect to PostgreSQL", error as Error);
            throw new DBException("Failed to connect to PostgreSQL", error as Error);
        }
    }
    public static async checkConnection(): Promise<boolean> {
    try {
        const client = await this.getConnection();
        await client.query("SELECT 1");
        client.release();
        return true;
    } catch (error) {
        return false;
    }
}

}
