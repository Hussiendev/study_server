import { Flashcard } from "../models/Flashcard";
import { id, Intiazable, IRepository } from "./IRepo";
import { DBException, RepositoryInitializationException } from "../util/exceptions/RepoException";
import logger from "../util/logger";
import { ConnectionManager } from "./ConnectionManger";
import { NotFoundException } from "../util/exceptions/http/NotFoundException";
import { idGenerater } from "../util/IDgenerater";
import { SQLMapper, SQLFlashcard } from "../mapper/Flashcard.Mapper";

export const createFlashcardTable = `
CREATE TABLE IF NOT EXISTS "flashcards" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  pdf_id TEXT NOT NULL REFERENCES "pdf_documents"(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export const insert_flashcard_query = `
INSERT INTO "flashcards" (id, user_id, pdf_id, question, answer, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);
`;

const Get_Flashcard = 'SELECT * FROM "flashcards" WHERE id = $1;';
const Get_All_Flashcards = 'SELECT * FROM "flashcards";';
const Get_Flashcards_By_User = 'SELECT * FROM "flashcards" WHERE user_id = $1;';
const Update_Flashcard = 'UPDATE "flashcards" SET question = $1, answer = $2, updated_at = NOW() WHERE id = $3;';
const Delete_Flashcard = 'DELETE FROM "flashcards" WHERE id = $1;';

export class FlashcardRepo implements IRepository<Flashcard>, Intiazable {
  async init(): Promise<void> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      await connection.query(createFlashcardTable);
      logger.info("Flashcards table ensured in the database");
    } catch (error) {
      logger.error("Failed to initialize Flashcard repository", error as Error);
      throw new RepositoryInitializationException("Failed to initialize Flashcard repository", error as Error);
    } finally {
      connection?.release();
    }
  }

  async create(item: Flashcard): Promise<id> {
    let connection;
    const generatedId = idGenerater("flashcard");

    try {
      connection = await ConnectionManager.getConnection();
      await connection.query("BEGIN");

      const now = new Date();
      await connection.query(insert_flashcard_query, [
        generatedId,
        item.getUserId(),
        item.getPdfId(),
        item.getQuestion(),
        item.getAnswer(),
        now,
        now,
      ]);

      await connection.query("COMMIT");

      item.setId(generatedId);
      logger.info(`Flashcard created successfully: ${generatedId}`);
      return generatedId;
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      logger.error("DB error during Flashcard create", error as Error);
      throw new DBException("Error creating Flashcard", error as Error);
    } finally {
      connection?.release();
    }
  }

  async get(id: id): Promise<Flashcard> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      const result = await connection.query<SQLFlashcard>(Get_Flashcard, [id]);
      const row = result.rows[0];

      if (!row) {
        throw new NotFoundException(`Flashcard with id ${id} not found`, { flashcardId: id });
      }

      return new SQLMapper().map(row);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      logger.error("DB error fetching Flashcard", error as Error);
      throw new DBException("Error fetching Flashcard", error as Error);
    } finally {
      connection?.release();
    }
  }

  async getALL(): Promise<Flashcard[]> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      const result = await connection.query<SQLFlashcard>(Get_All_Flashcards);

      if (!result.rows.length) return [];
      return result.rows.map(row => new SQLMapper().map(row));
    } catch (error) {
      logger.error("DB error fetching all Flashcards", error as Error);
      throw new DBException("Error fetching Flashcards", error as Error);
    } finally {
      connection?.release();
    }
  }

  async getByUserId(userId: string): Promise<Flashcard[]> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      const result = await connection.query<SQLFlashcard>(Get_Flashcards_By_User, [userId]);

      if (!result.rows.length) return [];
      return result.rows.map(row => new SQLMapper().map(row));
    } catch (error) {
      logger.error("DB error fetching Flashcards by user", error as Error);
      throw new DBException("Error fetching Flashcards by user", error as Error);
    } finally {
      connection?.release();
    }
  }

  async update(item: Flashcard): Promise<id> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      await connection.query("BEGIN");

      const result = await connection.query(Update_Flashcard, [item.getQuestion(), item.getAnswer(), item.getId()]);
      if (result.rowCount === 0) {
        throw new NotFoundException(`Flashcard with id ${item.getId()} not found`, { flashcardId: item.getId() });
      }

      await connection.query("COMMIT");
      logger.info(`Flashcard updated: ${item.getId()}`);
      return item.getId();
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      if (error instanceof NotFoundException) throw error;
      logger.error("DB error during Flashcard update", error as Error);
      throw new DBException("Error updating Flashcard", error as Error);
    } finally {
      connection?.release();
    }
  }

  async delete(id: id): Promise<void> {
    let connection;
    try {
      connection = await ConnectionManager.getConnection();
      await connection.query("BEGIN");

      const result = await connection.query(Delete_Flashcard, [id]);
      if (result.rowCount === 0) {
        throw new NotFoundException(`Flashcard with id ${id} not found`, { flashcardId: id });
      }

      await connection.query("COMMIT");
      logger.info(`Flashcard deleted: ${id}`);
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      if (error instanceof NotFoundException) throw error;
      logger.error("DB error during Flashcard delete", error as Error);
      throw new DBException("Error deleting Flashcard", error as Error);
    } finally {
      connection?.release();
    }
  }
}

export async function createFlashcardRepo(): Promise<FlashcardRepo> {
  const repo = new FlashcardRepo();
  await repo.init();
  return repo;
}
