import { Request, Response } from 'express';
import { FlashcardService } from '../service/Flashcard.Service';
import { JSONMapper } from '../mapper/Flashcard.Mapper';
import logger from '../util/logger';
import { AuthRequest } from '../config/authRequest';

export class FlashcardController {
  private jsonMapper: JSONMapper;

  constructor(private flashcardService: FlashcardService) {
    this.jsonMapper = new JSONMapper();
  }

  async generateFlashcards(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user.userId;
      logger.info(`Request body: ${JSON.stringify(req.body)}`);
      const pdfId = req.body.pdfId || req.body['pdfId '];
      logger.info(`Generating flashcards for user ${userId} from PDF ${pdfId}`);

      if (!pdfId) {
        res.status(400).json({ error: 'pdfId is required in request body' });
        return;
      }

      const generatedFlashcards = await this.flashcardService.generateFromPdf(userId, pdfId);
      const jsonOutput = generatedFlashcards.map(fc => this.jsonMapper.reversemap(fc));

      res.status(201).json({ flashcards: jsonOutput, message: 'Flashcards generated successfully' });
    } catch (error: any) {
      logger.error('Flashcard generation error', error);
      res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
    }
  }

  async getUserFlashcards(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user.userId;

      const flashcards = await this.flashcardService.getUserFlashcards(userId);
      const jsonOutput = flashcards.map(fc => this.jsonMapper.reversemap(fc));

      res.json({ flashcards: jsonOutput });
    } catch (error: any) {
      logger.error('Flashcard retrieval error', error);
      res.status(500).json({ error: error.message || 'Failed to fetch flashcards' });
    }
  }

  async getFlashcardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const flashcard = await this.flashcardService.getFlashcardById(id);
      res.json({ flashcard: this.jsonMapper.reversemap(flashcard) });
    } catch (error: any) {
      logger.error('Flashcard fetch error', error);
      res.status(500).json({ error: error.message || 'Failed to fetch flashcard' });
    }
  }
}
