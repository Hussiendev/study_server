import { Flashcard } from "../models/Flashcard";
import { IMapper } from "./IMapper";
import { FlashcardBuilder } from "../builder/Flashcard.builder";
import { idGenerater } from "../util/IDgenerater";

export interface SQLFlashcard {
  id: string;
  user_id: string;
  pdf_id: string;
  question: string;
  answer: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface JSONFlashcard {
  id: string;
  userId: string;
  question: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SQLMapper implements IMapper<SQLFlashcard, Flashcard> {
  map(input: SQLFlashcard): Flashcard {
    return FlashcardBuilder.createBuilder()
      .setId(input.id)
      .setUserId(input.user_id)
      .setPdfId(input.pdf_id)
      .setQuestion(input.question)
      .setAnswer(input.answer)
      .build();
  }

  reversemap(input: Flashcard): SQLFlashcard {
    return {
      id: input.getId(),
      user_id: input.getUserId(),
      pdf_id: input.getPdfId(),
      question: input.getQuestion(),
      answer: input.getAnswer(),
     
    };
  }
}

export class JSONMapper implements IMapper<any, Flashcard> {
  map(input: any, userId?: string,pdfid?:string): Flashcard {
    const id = idGenerater("flashcard");
   ;

    return FlashcardBuilder.createBuilder()
      .setId(id)
      .setUserId(userId || "")
      .setPdfId(pdfid || "")
      .setQuestion(input.question)
      .setAnswer(input.answer)
  
      .build();
  }

  reversemap(input: Flashcard): JSONFlashcard {
    return {
      id: input.getId(),
      userId: input.getUserId(),
      question: input.getQuestion(),
      answer: input.getAnswer(),
 
    };
  }
}
