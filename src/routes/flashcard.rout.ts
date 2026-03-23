import { Router } from 'express';
import { FlashcardController } from '../controller/FlashcardController';
import { FlashcardService } from '../service/Flashcard.Service';
import { PdfService } from '../service/Pdf.Service';
import { AiService } from '../service/AI.Service';
import { asyncHandler } from '../midlleware/asynchandler';
import { authenticate } from '../midlleware/auth';
import { hasPermission } from '../midlleware/autharize';
import { PERMISSION } from '../config/roles';
import config from '../config';

const router = Router();

// Service wiring
const aiService = new AiService(config.geminiApiKey || '', 'gemini-2.5-flash');
const pdfService = new PdfService(aiService, 'uploads');
const flashcardService = new FlashcardService(aiService, pdfService);
const flashcardController = new FlashcardController(flashcardService);

// Generate flashcards from an existing uploaded PDF
router.post(
  '/generate',
  authenticate,
  hasPermission(PERMISSION.GENERATE_FLASHCARDS),
  asyncHandler(flashcardController.generateFlashcards.bind(flashcardController))
);

// Get all flashcards for current user
router.get(
  '/',
  authenticate,
  hasPermission(PERMISSION.READ_FLASHCARDS),
  asyncHandler(flashcardController.getUserFlashcards.bind(flashcardController))
);

// Get one flashcard by id
router.get(
  '/:id',
  authenticate,
  hasPermission(PERMISSION.READ_FLASHCARDS),
  asyncHandler(flashcardController.getFlashcardById.bind(flashcardController))
);

export default router;
