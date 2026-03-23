import { Router } from "express";

import UserRouter from "./user.rout";
import authRoter from "./auth.rout";
import pdf from "./pdf.rout";
import flashcard from "./flashcard.rout";

const router=Router();

// Define your routes here
 

    router.use('/users', UserRouter);
    router.use('/auth', authRoter);
    router.use('/pdf',pdf);
    router.use('/flashcards', flashcard);

export default router;