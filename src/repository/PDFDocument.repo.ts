import { PDFDocument } from "../models/PDFDocument";
import { id, Intiazable, IRepository } from "./IRepo";
import { DBException, RepositoryInitializationException } from "../util/exceptions/RepoException";
import logger from "../util/logger";
import { ConnectionManager } from "./ConnectionManger";
import { NotFoundException } from "../util/exceptions/http/NotFoundException";

import { idGenerater } from "../util/IDgenerater";
import { SQLMapper, SQLPDFDocument } from "../mapper/PDFDocument.Mapper";

export const createPDFDocument = `
CREATE TABLE IF NOT EXISTS "pdf_documents" (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    storage_path TEXT NOT NULL,
    original_text TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export const insert_pdf_query = `
INSERT INTO "pdf_documents" (id, user_id, filename, file_size, mime_type, storage_path, original_text, summary)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
`;

const Get_PDF = 'SELECT * FROM "pdf_documents" WHERE id = $1;';
const Get_All_PDFs = 'SELECT * FROM "pdf_documents";';
const Get_PDFs_By_User = 'SELECT * FROM "pdf_documents" WHERE user_id = $1;';
const Update_PDF = 'UPDATE "pdf_documents" SET filename = $1, file_size = $2, mime_type = $3, storage_path = $4, original_text = $5, summary = $6, updated_at = NOW() WHERE id = $7;';
const Delete_PDF = 'DELETE FROM "pdf_documents" WHERE id = $1;';

export class PDFDocumentRepo implements IRepository<PDFDocument>, Intiazable {

    async init(): Promise<void> {
        let connection;
        try {
            connection = await ConnectionManager.getConnection();
            await connection.query(createPDFDocument);
            logger.info("PDF documents table ensured in the database");
        } catch (error) {
            logger.error("Failed to initialize PDF repository", error as Error);
            throw new RepositoryInitializationException(
                "Failed to initialize PDF repository",
                error as Error
            );
        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // CREATE
    // -------------------------
    async create(item: PDFDocument): Promise<id> {
        let connection;
        const generatedId = idGenerater("pdf");

        try {
            connection = await ConnectionManager.getConnection();
            await connection.query("BEGIN");

            await connection.query(insert_pdf_query, [
                generatedId,
                item.getUserId(),
                item.getFilename(),
                item.getFileSize(),
                item.getMimeType(),
                item.getStoragePath(),
                item.getOriginalText() || null,
                item.getSummary() || null
            ]);

            await connection.query("COMMIT");

            item.setId(generatedId);
            logger.info(`PDF document created successfully: ${generatedId}`);
            return generatedId;

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            logger.error("DB error during PDF create", error as Error);
            throw new DBException("Error creating PDF document", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET BY ID
    // -------------------------
    async get(id: id): Promise<PDFDocument> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLPDFDocument>(Get_PDF, [id]);

            const row = result.rows[0];
            if (!row) {
                throw new NotFoundException(
                    `PDF document with id ${id} not found`,
                    { pdfId: id }
                );
            }

            return new SQLMapper().map(row);

        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            logger.error("DB error fetching PDF document", error as Error);
            throw new DBException("Error fetching PDF document", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET ALL
    // -------------------------
    async getALL(): Promise<PDFDocument[]> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLPDFDocument>(Get_All_PDFs);

            if (!result.rows.length) {
                return [];
            }

            const mapper = new SQLMapper();
            return result.rows.map(row => mapper.map(row));

        } catch (error) {
            logger.error("DB error fetching all PDF documents", error as Error);
            throw new DBException("Error fetching PDF documents", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // GET BY USER ID
    // -------------------------
    async getByUserId(userId: string): Promise<PDFDocument[]> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            const result = await connection.query<SQLPDFDocument>(Get_PDFs_By_User, [userId]);

            if (!result.rows.length) {
                return [];
            }

            const mapper = new SQLMapper();
            return result.rows.map(row => mapper.map(row));

        } catch (error) {
            logger.error("DB error fetching PDF documents by user", error as Error);
            throw new DBException("Error fetching PDF documents by user", error as Error);

        } finally {
            connection?.release();
        }
    }

    // -------------------------
    // UPDATE
    // -------------------------
    async update(item: PDFDocument): Promise<id> {
        let connection;

        try {
            connection = await ConnectionManager.getConnection();
            await connection.query("BEGIN");

            const result = await connection.query(Update_PDF, [
                item.getFilename(),
                item.getFileSize(),
                item.getMimeType(),
                item.getStoragePath(),
                item.getOriginalText() || null,
                item.getSummary() || null,
                item.getId()
            ]);

            if (result.rowCount === 0) {
                throw new NotFoundException(
                    `PDF document with id ${item.getId()} not found`,
                    { pdfId: item.getId() }
                );
            }

            await connection.query("COMMIT");
            logger.info(`PDF document updated: ${item.getId()}`);
            return item.getId();

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error during PDF update", error as Error);
            throw new DBException("Error updating PDF document", error as Error);

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

            const result = await connection.query(Delete_PDF, [id]);

            if (result.rowCount === 0) {
                throw new NotFoundException(
                    `PDF document with id ${id} not found`,
                    { pdfId: id }
                );
            }

            await connection.query("COMMIT");
            logger.info(`PDF document deleted: ${id}`);

        } catch (error) {
            if (connection) await connection.query("ROLLBACK");

            if (error instanceof NotFoundException) throw error;

            logger.error("DB error during PDF delete", error as Error);
            throw new DBException("Error deleting PDF document", error as Error);

        } finally {
            connection?.release();
        }
    }
}

export async function createPDFDocumentRepo(): Promise<PDFDocumentRepo> {
    const repo = new PDFDocumentRepo();
    await repo.init();
    return repo;
}
