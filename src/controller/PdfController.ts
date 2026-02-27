// src/controller/PdfController.ts
import { Request, Response } from 'express';
import { PdfService } from '../service/Pdf.Service';
import { AuthRequest } from '../config/authRequest';
import { PdfJsonMapper, UploadPDFInput } from '../mapper/PdfMapper';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';
import logger from '../util/logger';

export class PdfController {
    private jsonMapper = new PdfJsonMapper();

    constructor(private pdfService: PdfService) {}

    /**
     * POST /api/pdf/upload
     * Upload a PDF file or provide a URL
     */
    uploadPDF = async (req: Request, res: Response): Promise<void> => {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.userId;
        
        logger.info(`PDF upload request from user: ${userId}`);

        // Convert request to input format using mapper
        const input: UploadPDFInput = this.jsonMapper.fromRequest(req);

        // Process the upload
        const result = await this.pdfService.uploadPDF(userId, input);

        res.status(201).json({
            success: true,
            message: 'PDF uploaded and processed successfully',
            data: result
        });
    };

 
}