import { PdfDocument } from "../models/Pdfmodel";
import { IMapper } from "./IMapper";
import { PdfBuilder } from "../builder/PdfBuilder";
import { idGenerater } from "../util/IDgenerater";
  // Import directly from multer

 export interface SQLPDF{
     id: string;
     userId: string;
     filename: string;
  
     fileSize: number;
     summary: string | null;
     createdAt: Date;
}
export interface UploadPDFInput {
    pdfFile?:   Express.Multer.File;  // If uploading file
    pdfLink?: string;                // If providing URL
}

// What we send back to user after processing
export interface UploadPDFResponse {
    id: string;
    filename: string;
    fileSize: number;
    summary: string;
    createdAt: Date;
}

export class PDFMAPPer implements IMapper<SQLPDF,PdfDocument>{
    map(input: SQLPDF): PdfDocument {
       return PdfBuilder.createBuilder().
       setId(idGenerater('pdf'))
       .setUserId(input.userId)
       .setFilename(input.filename)
       .setFileSize(input.fileSize)
       .setSummary(input.summary)
       .build();
    }
    reversemap(input: PdfDocument): SQLPDF {
      return {
      id:input.getId(),
        userId:input.getUserId(),
        filename:input.getFilename(),
        fileSize:input.getFileSize(),
        summary:input.getSummary(),
        createdAt:input.getCreatedAt()
      }
    }

}
export class PdfJsonMapper {
    
    mapToDomain(input: UploadPDFInput, userId: string): PdfDocument {
        
        let filename = 'document.pdf';
        if (input.pdfFile) {
            filename = input.pdfFile.originalname;
        } else if (input.pdfLink) {
            const urlParts = input.pdfLink.split('/');
            filename = urlParts[urlParts.length - 1] || 'from-url.pdf';
            if (!filename.includes('.')) filename += '.pdf';
        }

        const fileSize = input.pdfFile?.size || 0;

        return PdfBuilder.createBuilder()
            .setId(idGenerater('pdf'))
            .setUserId(userId)
            .setFilename(filename)
            .setFileSize(fileSize)
            .setSummary(null)
            .build();
    }

    mapToResponse(pdf: PdfDocument): UploadPDFResponse {
        return {
            id: pdf.getId(),
            filename: pdf.getFilename(),
            fileSize: pdf.getFileSize(),
            summary: pdf.getSummary() || '',
            createdAt: pdf.getCreatedAt()
        };
    }

    fromRequest(req: any): UploadPDFInput {
        return {
            pdfFile: req.file,
            pdfLink: req.body.link
        };
    }
}