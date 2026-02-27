// src/models/PdfDocument.model.ts
import { idGenerater } from "../util/IDgenerater";

export class PdfDocument {
    private id: string;
    private userId: string;
    private filename: string;
  
    private fileSize: number;
    private summary: string | null;
    private createdAt: Date;


    constructor(
        id:string,
        userId: string,
        filename: string,

        fileSize: number,
        summary: string | null = null
    ) {
        this.id = id;
        this.userId = userId;
        this.filename = filename;
   
        this.fileSize = fileSize;
        this.summary = summary;
        this.createdAt = new Date();
    
    }

    // Getters
    getId(): string { return this.id; }
    getUserId(): string { return this.userId; }
    getFilename(): string { return this.filename; }
   
    getFileSize(): number { return this.fileSize; }
    getSummary(): string | null { return this.summary; }
    getCreatedAt(): Date { return this.createdAt; }
 

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

    setSummary(summary: string | null): void { 
        this.summary = summary; 
     
    }

    setCreatedAt(date: Date): void { 
        this.createdAt = date; 
    }



    // Batch update method (optional but useful)
   
}