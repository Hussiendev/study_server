// src/service/pdfService.ts
import { PdfRepo ,createPdfRepo} from '../repository/Pdf.repo'

import { 
    PdfJsonMapper, 
    UploadPDFInput, 
    UploadPDFResponse,
    PDFMAPPer 
} from '../mapper/PdfMapper';

import { PdfExtractorService } from '../service/PdfExtraction.Service';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';
import logger from '../util/logger';
import fs from 'fs';
import util from 'util';
import { create } from 'domain';

const unlinkFile = util.promisify(fs.unlink);

export class PdfService {
    private pdfRepo!: PdfRepo;
    private jsonMapper = new PdfJsonMapper();
    private sqlMapper = new PDFMAPPer(); // For DB operations
    private extractor = new PdfExtractorService();

    /**
     * Upload and process PDF - handles both file and URL uploads
     */
    async uploadPDF(userId: string, input: UploadPDFInput): Promise<UploadPDFResponse> {
        logger.info(`Processing PDF upload for user: ${userId}`);

        // Validate input
        this.validateInput(input);

        let filePathToClean: string | null = null;

        try {
            // STEP 1: Create initial PDF document (without summary)
            const pdfDoc = this.jsonMapper.mapToDomain(input, userId);
            
            // STEP 2: Extract PDF content based on input type
            let extractedData;
            if (input.pdfFile) {
                // Handle file upload
                filePathToClean = input.pdfFile.path;
                extractedData = await this.extractor.extractFromFile(input.pdfFile.path);
            } else {
                // Handle URL upload
                extractedData = await this.extractor.extractFromUrl(input.pdfLink!);
            }

            // STEP 3: Generate summary from extracted content
            const summary = this.extractor.generateSummary(extractedData);
            const formattedSummary = this.extractor.formatSummaryForStorage(summary);

            // STEP 4: Set the summary on the PDF document
            pdfDoc.setSummary(formattedSummary);

            // STEP 5: Save to database using SQL mapper
            await (await this.getRepo()).create(pdfDoc);

            // STEP 6: Clean up temp file if it was a file upload
            if (filePathToClean) {
                await unlinkFile(filePathToClean).catch(e => 
                    logger.error('Error cleaning up temp file:', e)
                );
            }

            logger.info(`PDF uploaded successfully. ID: ${pdfDoc.getId()}`);

            // STEP 7: Return response using JSON mapper
            return this.jsonMapper.mapToResponse(pdfDoc);

        } catch (error) {
            // Clean up temp file on error
            if (filePathToClean) {
                await unlinkFile(filePathToClean).catch(e => 
                    logger.error('Error cleaning up temp file on error:', e)
                );
            }
            
            logger.error('Error in uploadPDF:', error);
            throw error;
        }
    }

   
    /**
     * Validate input
     */
    private validateInput(input: UploadPDFInput): void {
        const hasFile = !!input.pdfFile;
        const hasLink = !!input.pdfLink;

        if (!hasFile && !hasLink) {
            throw new BadRequestException('Either a PDF file or a PDF link must be provided');
        }

        if (hasFile && hasLink) {
            throw new BadRequestException('Provide either a file OR a link, not both');
        }

        // Validate file size if file provided
        if (hasFile && input.pdfFile!.size > 10 * 1024 * 1024) {
            throw new BadRequestException('PDF file size cannot exceed 10MB');
        }

        // Validate file type if file provided
        if (hasFile && input.pdfFile!.mimetype !== 'application/pdf') {
            throw new BadRequestException('Uploaded file must be a PDF');
        }
    }

    /**
     * Get repository instance
     */
    private async getRepo(): Promise<PdfRepo> {
        if (!this.pdfRepo) {
            this.pdfRepo = await createPdfRepo();
        }
        return this.pdfRepo;
    }
}