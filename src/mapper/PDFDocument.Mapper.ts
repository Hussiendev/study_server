import { PDFDocument } from "../models/PDFDocument";
import { IMapper } from "./IMapper";
import { PDFDocumentBuilder } from "../builder/PDFDocument.builder";
import { idGenerater } from "../util/IDgenerater";
import logger from "../util/logger";

export interface SQLPDFDocument {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  original_text?: string;
  summary?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SQLMapper implements IMapper<SQLPDFDocument, PDFDocument> {
  map(input: SQLPDFDocument): PDFDocument {
    return PDFDocumentBuilder.createBuilder()
      .setId(input.id)
      .setUserId(input.user_id)
      .setFilename(input.filename)
      .setFileSize(input.file_size)
      .setMimeType(input.mime_type)
      .setStoragePath(input.storage_path)
      .setOriginalText(input.original_text ?? "")
      .setSummary(input.summary ?? "")
      .build();
  }

  reversemap(input: PDFDocument): SQLPDFDocument {
    return {
      id: input.getId(),
      user_id: input.getUserId(),
      filename: input.getFilename(),
      file_size: input.getFileSize(),
      mime_type: input.getMimeType(),
      storage_path: input.getStoragePath(),
      original_text: input.getOriginalText(),
      summary: input.getSummary(),
    };
  }
}

export class JSONMapper implements IMapper<any, PDFDocument> {
  map(input: any, userId?: string): PDFDocument {
    const generatedId = idGenerater("pdf");
    const mappedUserId = userId || input.userId || input.user_id || "";

    return PDFDocumentBuilder.createBuilder()
      .setId(generatedId)
      .setUserId(mappedUserId)
      .setFilename(input.filename)
      .setFileSize(input.file_size)
      .setMimeType(input.mime_type || "application/pdf")
      .setStoragePath(input.storage_path)
      .setOriginalText(input.original_text || "")
      .setSummary(input.summary || "")
      .build();
  }

  reversemap(input: PDFDocument): any {
    return {
      id: input.getId(),
      userId: input.getUserId(),
      filename: input.getFilename(),
      fileSize: input.getFileSize(),
      mimeType: input.getMimeType(),
      storagePath: input.getStoragePath(),
      originalText: input.getOriginalText(),
      summary: input.getSummary(),
    };
  }
}
