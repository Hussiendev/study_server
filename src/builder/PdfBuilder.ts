import { PdfDocument } from "../models/Pdfmodel";

export class PdfBuilder{
      private id!: string;
    private userId!: string;
    private filename!: string;
  
    private fileSize!: number;
    private summary!: string | null;
    private createdAt!: Date;
     // Setters
     
    public static createBuilder(): PdfBuilder {
        return new PdfBuilder();
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
        return this; 
     
    }



    setFileSize(fileSize: number): this { 
        this.fileSize = fileSize;
        return this; 
        
    }

    setSummary(summary: string | null): this { 
        this.summary = summary; 
        return this;
    }
     build(): PdfDocument {
            const required = [this.id,this.userId,this.filename,this.fileSize,this.summary]
            for (const field of required) {
                if (field === undefined) {
                    throw new Error("Missing required fields to build User");
                }
            }
            return new PdfDocument(this.id,this.userId,this.filename,this.fileSize,this.summary)
        }

}