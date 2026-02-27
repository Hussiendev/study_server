// src/service/pdfExtractor.service.ts
import axios from 'axios';
import fs from 'fs';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';
import logger from '../util/logger';

// Import the PDFParse class from pdf-parse
import { PDFParse } from 'pdf-parse';

export interface ExtractedPDFData {
    text: string;
    numPages: number;
    info: {
        Title?: string;
        Author?: string;
        Subject?: string;
        Keywords?: string;
        Creator?: string;
        Producer?: string;
        CreationDate?: string;
        ModDate?: string;
    };
    metadata: any;
    wordCount: number;
}

export interface PDFSummary {
    brief: string;
    mainPoints: string[];
    wordCount: number;
    pageCount: number;
    keyPhrases: string[];
    estimatedReadTime: number;
}

export class PdfExtractorService {
    
    /**
     * Extract from uploaded file
     */
    async extractFromFile(filePath: string): Promise<ExtractedPDFData> {
        try {
            logger.info(`Extracting PDF from file: ${filePath}`);
            
            // Read file
            const dataBuffer = fs.readFileSync(filePath);
            
            // Create a new PDFParse instance with the data
            const pdfParser = new PDFParse({
                data: new Uint8Array(dataBuffer)
            });
            
            // Get the text content
            const textResult = await pdfParser.getText();
            
            // Get document info
            const infoResult = await pdfParser.getInfo();
            
            // Combine the text from all pages
            const fullText = textResult.pages.map(page => page.text).join('\n');
            
            // Calculate word count
            const wordCount = this.countWords(fullText);
            
            logger.info(`PDF extracted successfully: ${infoResult.total} pages, ${wordCount} words`);
            
            return {
                text: fullText,
                numPages: infoResult.total,
                info: infoResult.info || {},
                metadata: infoResult.metadata || {},
                wordCount
            };
            
        } catch (error) {
            logger.error('Error extracting PDF from file:', error);
            throw new BadRequestException('Failed to extract content from PDF file');
        }
    }

    /**
     * Extract from URL
     */
    async extractFromUrl(url: string): Promise<ExtractedPDFData> {
        try {
            logger.info(`Extracting PDF from URL: ${url}`);
            
            // Validate URL
            try {
                new URL(url);
            } catch {
                throw new BadRequestException('Invalid URL format');
            }

            // Download PDF with timeout
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 10 * 1024 * 1024
            });

            // Verify it's a PDF
            const contentType = response.headers['content-type'];
            if (!contentType?.includes('pdf')) {
                throw new BadRequestException('URL does not point to a valid PDF file');
            }

            // Parse PDF
            const dataBuffer = Buffer.from(response.data);
            
            // Create a new PDFParse instance with the data
            const pdfParser = new PDFParse({
                data: new Uint8Array(dataBuffer)
            });
            
            // Get the text content
            const textResult = await pdfParser.getText();
            
            // Get document info
            const infoResult = await pdfParser.getInfo();
            
            // Combine the text from all pages
            const fullText = textResult.pages.map(page => page.text).join('\n');
            
            // Calculate word count
            const wordCount = this.countWords(fullText);
            
            logger.info(`PDF from URL extracted successfully: ${infoResult.total} pages, ${wordCount} words`);
            
            return {
                text: fullText,
                numPages: infoResult.total,
                info: infoResult.info || {},
                metadata: infoResult.metadata || {},
                wordCount
            };
            
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            
            logger.error('Error extracting PDF from URL:', error);
            throw new BadRequestException('Failed to download or extract PDF from URL');
        }
    }

    /**
     * Generate comprehensive summary from extracted data
     */
    generateSummary(extractedData: ExtractedPDFData): PDFSummary {
        const text = extractedData.text;
        
        // Clean text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        // Split into sentences
        const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
        
        // Generate brief (first 2-3 sentences)
        const brief = this.generateBrief(sentences);
        
        // Extract main points
        const mainPoints = this.extractMainPoints(cleanText, sentences);
        
        // Extract key phrases
        const keyPhrases = this.extractKeyPhrases(cleanText);
        
        // Calculate estimated reading time (average 200 words per minute)
        const estimatedReadTime = Math.ceil(extractedData.wordCount / 200);

        return {
            brief,
            mainPoints,
            wordCount: extractedData.wordCount,
            pageCount: extractedData.numPages,
            keyPhrases,
            estimatedReadTime
        };
    }

    /**
     * Format summary for storage (JSON string)
     */
    formatSummaryForStorage(summary: PDFSummary): string {
        return JSON.stringify({
            ...summary,
            generatedAt: new Date().toISOString()
        });
    }

    /**
     * Parse stored summary back to object
     */
    parseStoredSummary(summaryString: string): PDFSummary | null {
        try {
            return JSON.parse(summaryString);
        } catch {
            return null;
        }
    }

    /**
     * Get plain text summary for quick display
     */
    getPlainTextSummary(summary: PDFSummary): string {
        return `
📄 PDF SUMMARY
═══════════════════════════════════════
📊 Stats: ${summary.pageCount} pages, ${summary.wordCount} words, ${summary.estimatedReadTime} min read

📝 Brief:
${summary.brief}

🔑 Main Points:
${summary.mainPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

🏷️ Key Topics: ${summary.keyPhrases.slice(0, 5).join(', ')}
        `.trim();
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Count words in text
     */
    private countWords(text: string): number {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Generate brief overview from first sentences
     */
    private generateBrief(sentences: string[]): string {
        if (sentences.length === 0) {
            return 'No content available to generate summary.';
        }

        const briefSentences = sentences.slice(0, 3).join(' ');
        
        if (briefSentences.length > 300) {
            return briefSentences.substring(0, 300) + '...';
        }
        
        return briefSentences;
    }

    /**
     * Extract main points from text
     */
    private extractMainPoints(text: string, sentences: string[]): string[] {
        const mainPoints: string[] = [];
        
        const indicators = [
            'main point', 'key point', 'important', 'significant',
            'first', 'second', 'third', 'finally', 'in conclusion',
            'therefore', 'thus', 'hence', 'consequently', 'summary',
            'overall', 'in summary', 'to conclude', 'the study shows'
        ];
        
        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (indicators.some(indicator => lowerSentence.includes(indicator))) {
                if (sentence.length > 20 && sentence.length < 200) {
                    mainPoints.push(sentence.trim());
                }
            }
        }

        if (mainPoints.length < 3) {
            const paragraphs = text.split('\n\n');
            for (const para of paragraphs.slice(0, 5)) {
                const firstSentence = para.split(/[.!?]/)[0];
                if (firstSentence.length > 30 && firstSentence.length < 200) {
                    mainPoints.push(firstSentence.trim() + '.');
                }
            }
        }

        if (mainPoints.length < 3 && sentences.length > 0) {
            for (let i = 0; i < Math.min(3, sentences.length); i++) {
                if (sentences[i].length > 20) {
                    mainPoints.push(sentences[i].trim());
                }
            }
        }

        const uniquePoints = [...new Set(mainPoints)];
        
        return uniquePoints
            .slice(0, 5)
            .map(point => point.charAt(0).toUpperCase() + point.slice(1));
    }

    /**
     * Extract key phrases based on frequency
     */
    private extractKeyPhrases(text: string): string[] {
        const stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
            'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
            'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
            'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
            'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
            'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
            'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
            'take', 'people', 'into', 'year', 'your', 'good', 'some',
            'could', 'them', 'see', 'other', 'than', 'then', 'now',
            'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work',
            'first', 'well', 'way', 'even', 'new', 'want', 'because',
            'any', 'these', 'give', 'day', 'most', 'us', 'was', 'had',
            'been', 'were', 'said', 'very', 'really', 'such', 'another'
        ]);

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        const freqMap = new Map<string, number>();
        words.forEach(word => {
            freqMap.set(word, (freqMap.get(word) || 0) + 1);
        });

        const phrases: string[] = [];
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = words[i] + ' ' + words[i + 1];
            phrases.push(phrase);
        }

        const phraseFreq = new Map<string, number>();
        phrases.forEach(phrase => {
            phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1);
        });

        const allTerms = [
            ...Array.from(freqMap.entries()),
            ...Array.from(phraseFreq.entries())
        ];

        return allTerms
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0])
            .filter(term => term.split(' ').length <= 2)
            .filter(term => term.length > 2)
            .slice(0, 15);
    }
}