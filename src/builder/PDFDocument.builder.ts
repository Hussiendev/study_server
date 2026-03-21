import logger from "../util/logger";
import { PDFDocument } from "../models/PDFDocument";

export class PDFDocumentBuilder {
    private id!: string;
    private userId!: string;
    private filename!: string;
    private fileSize!: number;
    private mimeType!: string;
    private storagePath!: string;
    private originalText!: string;
    private summary!: string;

    public static createBuilder(): PDFDocumentBuilder {
        return new PDFDocumentBuilder();
    }

    setId(id: string): this {
        this.id = id;
        return this;
    }

    setUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    setFilename(filename: string): this {
        this.filename = filename;
        logger.info(`Setting filename in PDFDocumentBuilder: ${filename}`);
        return this;
    }

    setFileSize(fileSize: number): this {
        this.fileSize = fileSize;
        return this;
    }

    setMimeType(mimeType: string): this {
        this.mimeType = mimeType;
        return this;
    }

    setStoragePath(storagePath: string): this {
        this.storagePath = storagePath;
        return this;
    }

    setOriginalText(originalText: string): this {
        this.originalText = originalText;
        return this;
    }

    setSummary(summary: string): this {
        this.summary = summary;
        return this;
    }

    build(): PDFDocument {
        const required = [this.id, this.userId, this.filename, this.fileSize, this.storagePath];
        for (const field of required) {
            if (field === undefined) {
                throw new Error("Missing required fields to build PDFDocument");
            }
        }
        return new PDFDocument(
            this.id,
            this.userId,
            this.filename,
            this.fileSize,
            this.storagePath,
            this.mimeType || 'application/pdf',
            this.originalText,
            this.summary
        );
    }
}