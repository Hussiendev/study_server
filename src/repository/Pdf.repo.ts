import { PdfDocument } from "../models/Pdfmodel";
import { id, Intiazable, IRepository } from "./IRepo";
import { ConnectionManager } from "./ConnectionManger";
import logger from "../util/logger";
import { RepositoryInitializationException } from "../util/exceptions/RepoException";

const CREATE_PDF_TABLE = `
CREATE TABLE IF NOT EXISTS pdf_documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,

    file_size INTEGER NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdf_documents_user_id ON pdf_documents(user_id);
`;

const INSERT_PDF = `
INSERT INTO pdf_documents (id, user_id, filename, file_size, summary)
VALUES ($1, $2, $3, $4, $5)
`;

export class PdfRepo implements IRepository<PdfDocument>,Intiazable{
    async init(): Promise<void> {
           let connection;
     try{
        connection=await ConnectionManager.getConnection();
        await connection.query(CREATE_PDF_TABLE);
        logger.info('intialized the  repo');
     

     }
     catch(error){
        logger.error(error);
          throw new RepositoryInitializationException(
                        "Failed to initialize repository",
                        error as Error
                    );

     }
     finally{
        connection?.release()

     }
    }
   async create(item: PdfDocument): Promise<id> {
        let connection;
     try{
        connection=await ConnectionManager.getConnection()
        await connection.query('Begin');
        await connection.query(INSERT_PDF,[item.getId(),item.getUserId(),item.getFilename(),item.getFileSize(),item.getSummary()]);
        logger.info('intialized the  repo');
        connection.query('commit');
        logger.info('inserted succefuly');
        return item.getId()

     }
     catch(error){
             if (connection) await connection.query("ROLLBACK");

        logger.error(error);
          throw new RepositoryInitializationException(
                        "Failed to initialize repository",
                        error as Error
                    );

     }
     finally{
        connection?.release()

     }
    }
    get(id: id): Promise<PdfDocument> {
        throw new Error("Method not implemented.");
    }
    getALL(): Promise<PdfDocument[]> {
        throw new Error("Method not implemented.");
    }
    update(item: PdfDocument): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: id): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
export async function createPdfRepo(): Promise<PdfRepo> {
    const repo = new PdfRepo();
    await repo.init();
    return repo;
    }