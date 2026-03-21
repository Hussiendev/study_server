import { PDFDocumentRepo, createPDFDocumentRepo } from '../repository/PDFDocument.repo';
import { AiService } from './AI.Service';
import { JSONMapper } from '../mapper/PDFDocument.Mapper';
import { PDFDocument } from '../models/PDFDocument';
import logger from '../util/logger';
import fs from 'fs/promises';
import path from 'path';
import { NotFoundException } from '../util/exceptions/http/NotFoundException';

// Use require because it's a CommonJS module that exports a function
const pdfParse = require('pdf-parse');

export class PdfService {
  private pdfRepo: PDFDocumentRepo | null = null;
  private jsonMapper: JSONMapper;

  constructor(
    private aiService: AiService,
    private uploadDir: string
  ) {
    this.jsonMapper = new JSONMapper();
  }

  private async getRepo(): Promise<PDFDocumentRepo> {
    if (!this.pdfRepo) {
      this.pdfRepo = await createPDFDocumentRepo();
    }
    return this.pdfRepo;
  }

  async uploadPdf(userId: string, file: Express.Multer.File): Promise<PDFDocument> {
    const safeFileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = path.join(this.uploadDir, safeFileName);
    await fs.writeFile(storagePath, file.buffer);

    try {
      // Extract text from PDF buffer – pdfParse returns a Promise with { text }
      const pdfData = await pdfParse(file.buffer);
      const extractedText = pdfData.text;


      // Generate summary
      const summary = await this.aiService.generateSummary(extractedText);

      // Prepare object for JSONMapper
      const inputObject = {
        filename: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: storagePath,
        original_text: extractedText,
        summary: summary,
      };
      logger.info('Input object for PDFDocument:', inputObject);
      // Build PDFDocument via JSONMapper
      const pdfDocument = this.jsonMapper.map(inputObject, userId);

      // Save to database
      const repo = await this.getRepo();
      await repo.create(pdfDocument);

      return pdfDocument;
    } catch (error) {
      // Clean up file on error
      await fs.unlink(storagePath).catch(e => logger.error('Cleanup error', e));
      throw error;
    }
  }

  async getPdfById(id: string): Promise<PDFDocument | null> {
    try {
      const repo = await this.getRepo();
      return await repo.get(id);
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }

  async getUserPdfs(userId: string): Promise<PDFDocument[]> {
    const repo = await this.getRepo();
    return await repo.getByUserId(userId);
  }
}