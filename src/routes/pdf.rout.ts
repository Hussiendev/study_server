// routes/pdf.routes.ts
import { Router } from 'express';
import { PdfController } from '../controller/PdfController';
import { PdfService } from '../service/Pdf.Service';
import { AiService } from '../service/AI.Service';
import { asyncHandler } from '../midlleware/asynchandler';
import { authenticate } from '../midlleware/auth';
import { hasPermission } from '../midlleware/autharize';
import { PERMISSION } from '../config/roles';
import { uploadPDF } from '../midlleware/upload';
import config from '../config';

const router = Router();

// Lazy initialization of AI service and PDF service
const aiService = new AiService(config.geminiApiKey || '',  'gemini-2.5-flash');
const uploadDir = 'uploads'; // ensure this directory exists (create in app bootstrap)
const pdfService = new PdfService(aiService, uploadDir);
const pdfController = new PdfController(pdfService);

// Upload PDF – returns summary
router.post(
  '/upload',
  authenticate,
  hasPermission(PERMISSION.UPLOAD_PDF),
  uploadPDF,
  asyncHandler(pdfController.uploadPdf.bind(pdfController))
);

// (Optional) Get summary of a specific PDF by ID
router.get(
  '/:id/summary',
  authenticate,
  hasPermission(PERMISSION.READ_PDF),
  asyncHandler(pdfController.getPdfSummary.bind(pdfController))
);

// Get all PDFs of the current user
router.get(
  '/',
  authenticate,
  hasPermission(PERMISSION.READ_PDF),
  asyncHandler(pdfController.getUserPdfs.bind(pdfController))
);

export default router;