import { Router } from "express";

import UserRouter from "./user.rout";
import authRoter from "./auth.rout";

import pdfRouter from './pdf.rout'
import { authenticate } from "../midlleware/auth";
const router=Router();

// Define your routes here
 

    router.use('/users', UserRouter);
    router.use('/auth', authRoter);
    router.use('/pdf',authenticate,pdfRouter)

export default router;