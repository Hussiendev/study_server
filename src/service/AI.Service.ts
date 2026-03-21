import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import logger from '../util/logger';
import config from '../config';

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateSummary(text: string): Promise<string> {
    const maxChars = 30000;
    const truncated = text.length > maxChars ? text.substring(0, maxChars) : text;

    const prompt = `
      You are an expert study assistant. Summarize the following text in detailed bullet points.
      Cover the main ideas, key concepts, important details, and any definitions or formulas.
      Use clear, concise bullet points (each starting with "•" or "-"). 
      Organize them logically, grouping related points if helpful.

      Text:
      """${truncated}"""
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      // Log the full error for debugging
      logger.error('Gemini API error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        response: error.response?.data,
      });
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
}