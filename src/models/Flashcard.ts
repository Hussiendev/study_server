import { ID } from "../repository/IRepo";

export class Flashcard implements ID {
  id: string;
  userId: string;
  pdfId: string;
  question: string;
  answer: string;


  constructor(
    id: string,
    userId: string,
    pdfId: string,
    question: string,
    answer: string,
   
  ) {
    this.id = id;
    this.userId = userId;
    this.pdfId = pdfId;
    this.question = question;
    this.answer = answer;

  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getPdfId(): string {
    return this.pdfId;
  }

  getQuestion(): string {
    return this.question;
  }

  getAnswer(): string {
    return this.answer;
  }

  

  setId(id: string): void {
    this.id = id;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setPdfId(pdfId: string): void {
    this.pdfId = pdfId;
  }

  setQuestion(question: string): void {
    this.question = question;
  }

  setAnswer(answer: string): void {
    this.answer = answer;
  }

 
}
