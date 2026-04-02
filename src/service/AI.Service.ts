import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import logger from '../util/logger';
import config from '../config';

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-lite') {
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
  async generateFlashcards(content: string): Promise<Array<{ question: string; answer: string }>> {
    const maxChars = 30000;
    const truncated = content.length > maxChars ? content.substring(0, maxChars) : content;

    const prompt = `
      You are an expert study assistant. Based on the following content, create a set of flashcards to help a student learn the key concepts.
      Each flashcard should have a clear question and a concise answer.
      Output as a JSON array of objects with "question" and "answer" fields.
      Only output the JSON array – no other text, no explanations, no markdown.

      Content:
      """${truncated}"""
    `;

    try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Extract JSON from the response (in case the model adds extra text)
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in the response');
        }
        const flashcards = JSON.parse(jsonMatch[0]);
        return flashcards;
    } catch (error: any) {
        logger.error('Gemini API error during flashcard generation:', {
            message: error.message,
            status: error.status,
            response: error.response?.data,
        });
        throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
}
}