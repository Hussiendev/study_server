import { createFlashcardRepo, FlashcardRepo } from '../repository/Flashcard.repo';
import { AiService } from './AI.Service';
import { PdfService } from './Pdf.Service';
import { JSONMapper } from '../mapper/Flashcard.Mapper';
import { Flashcard } from '../models/Flashcard';
import { NotFoundException } from '../util/exceptions/http/NotFoundException';
import { ForbiddenException } from '../util/exceptions/http/ForbiddenException';

export class FlashcardService {
  private flashcardRepo: FlashcardRepo | null = null;
  private jsonMapper: JSONMapper;

  constructor(
    private aiService: AiService,
    private pdfService: PdfService
  ) {
    this.jsonMapper = new JSONMapper();
  }

  private async getRepo(): Promise<FlashcardRepo> {
    if (!this.flashcardRepo) {
      this.flashcardRepo = await createFlashcardRepo();
    }
    return this.flashcardRepo;
  }

  async generateFromPdf(userId: string, pdfId: string): Promise<Flashcard[]> {
    const pdf = await this.pdfService.getPdfById(pdfId);
    if (!pdf) {
      throw new NotFoundException(`PDF with id ${pdfId} not found`, { pdfId });
    }

    if (pdf.getUserId() !== userId) {
      throw new ForbiddenException('Not allowed to generate flashcards for this PDF');
    }

    const originalText = pdf.getOriginalText();
    if (!originalText || originalText.trim().length === 0) {
      throw new NotFoundException('PDF original text is empty or missing', { pdfId });
    }

    const generated = await this.aiService.generateFlashcards(originalText);
    if (!Array.isArray(generated) || generated.length === 0) {
      return [];
    }

    const repo = await this.getRepo();
    const saved: Flashcard[] = [];

    for (const item of generated) {
      if (!item?.question || !item?.answer) {
        continue;
      }

      const newFlashcard = this.jsonMapper.map(
        { question: item.question, answer: item.answer },
        userId,
        pdfId
      );

      await repo.create(newFlashcard);
      saved.push(newFlashcard);
    }

    return saved;
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    const repo = await this.getRepo();
    return await repo.getByUserId(userId);
  }

  async getFlashcardById(flashcardId: string): Promise<Flashcard> {
    const repo = await this.getRepo();
    return await repo.get(flashcardId);
  }

  async updateFlashcard(flashcard: Flashcard): Promise<void> {
    const repo = await this.getRepo();
    await repo.update(flashcard);
  }
}
