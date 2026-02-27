// src/routes/pdf.routes.ts
import { Router } from 'express';
import { PdfController } from '../controller/PdfController';
import { PdfService } from '../service/Pdf.Service';

import { upload } from '../midlleware/upload';
import { asyncHandler } from "../midlleware/asynchandler";
import { hasPermission } from '../midlleware/autharize';
import { PERMISSION } from '../config/roles';

const router = Router();
const pdfService = new PdfService();
const pdfController = new PdfController(pdfService);



// Upload PDF (multipart/form-data for file, JSON for link)
router.post(
    '/upload',
    hasPermission(PERMISSION.UPLOAD),
    upload.single('pdf'), // 'pdf' is the field name for file upload
    asyncHandler(pdfController.uploadPDF)
);




export default router;