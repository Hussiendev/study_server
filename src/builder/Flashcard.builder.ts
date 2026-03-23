import logger from "../util/logger";
import { Flashcard } from "../models/Flashcard";

export class FlashcardBuilder {
  private id!: string;
  private userId!: string;
  private pdfId!: string;
  private question!: string;
  private answer!: string;

  public static createBuilder(): FlashcardBuilder {
    return new FlashcardBuilder();
  }

  setId(id: string): this {
    this.id = id;
    return this;
  }

  setUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  setPdfId(pdfId: string): this {
    this.pdfId = pdfId;
    return this;
  }

  setQuestion(question: string): this {
    this.question = question;
    logger.info(`Setting flashcard question in FlashcardBuilder: ${question}`);
    return this;
  }

  setAnswer(answer: string): this {
    this.answer = answer;
    return this;
  }


  build(): Flashcard {
    const required = [this.id, this.userId, this.pdfId, this.question, this.answer];
    for (const field of required) {
      if (field === undefined) {
        throw new Error("Missing required fields to build Flashcard");
      }
    }

    return new Flashcard(
      this.id,
      this.userId,
      this.pdfId,
      this.question,
      this.answer,
    
    );
  }
}
