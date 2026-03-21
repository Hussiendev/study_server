// controller/Pdf.controller.ts
import { Request, Response } from 'express';
import { PdfService } from '../service/Pdf.Service';
import { JSONMapper } from '../mapper/PDFDocument.Mapper';
import logger from '../util/logger';
import { AuthRequest } from 'config/authRequest';

export class PdfController {
  private jsonMapper: JSONMapper;

  constructor(private pdfService: PdfService) {
    this.jsonMapper = new JSONMapper();
  }

  async uploadPdf(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No PDF file uploaded' });
        return;
      }

          const authReq = req as AuthRequest;
          const userId = authReq.user.userId

      const pdf = await this.pdfService.uploadPdf(userId, req.file);

      const jsonOutput = this.jsonMapper.reversemap(pdf);

      res.status(201).json({
        message: 'PDF uploaded and summary generated',
        pdf: jsonOutput,
      });
    } catch (error: any) {
      logger.error('Upload error', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }

  async getPdfSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pdf = await this.pdfService.getPdfById(id);
      if (!pdf) {
        res.status(404).json({ error: 'PDF not found' });
        return;
      }
      res.json({ summary: pdf.getSummary() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserPdfs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const pdfs = await this.pdfService.getUserPdfs(userId);
      const jsonOutput = pdfs.map(pdf => this.jsonMapper.reversemap(pdf));
      res.json({ pdfs: jsonOutput });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}