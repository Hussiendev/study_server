import { ID } from "../repository/IRepo";

export class PDFDocument implements ID {
    id: string;
    userId: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    originalText: string;
    summary: string;

    constructor(
        id: string,
        userId: string,
        filename: string,
        fileSize: number,
        storagePath: string,
        mimeType: string = 'application/pdf',
        originalText: string,
        summary: string
    ) {
        this.id = id;
        this.userId = userId;
        this.filename = filename;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.storagePath = storagePath;
        this.originalText = originalText;
        this.summary = summary;
    }

    // Getters
    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getFilename(): string {
        return this.filename;
    }

    getFileSize(): number {
        return this.fileSize;
    }

    getMimeType(): string {
        return this.mimeType;
    }

    getStoragePath(): string {
        return this.storagePath;
    }

    getOriginalText(): string | undefined {
        return this.originalText;
    }

    getSummary(): string | undefined {
        return this.summary;
    }

    // Setters
    setId(id: string): void {
        this.id = id;
    }

    setUserId(userId: string): void {
        this.userId = userId;
    }

    setFilename(filename: string): void {
        this.filename = filename;
    }

    setFileSize(fileSize: number): void {
        this.fileSize = fileSize;
    }

    setMimeType(mimeType: string): void {
        this.mimeType = mimeType;
    }

    setStoragePath(storagePath: string): void {
        this.storagePath = storagePath;
    }

    setOriginalText(originalText: string): void {
        this.originalText = originalText;
    }

    setSummary(summary: string): void {
        this.summary = summary;
    }
}