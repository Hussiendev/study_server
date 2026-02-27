// src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { idGenerater } from '../util/IDgenerater';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Where to save the file
    },
    filename: (req, file, cb) => {
        const uniqueId = idGenerater('pdf');  // Generate unique ID
        const ext = path.extname(file.originalname);  // Get file extension
        cb(null, `${uniqueId}${ext}`);  // Save with unique name
    }
});

// File filter - only allow PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);  // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed'));  // Reject non-PDFs
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});