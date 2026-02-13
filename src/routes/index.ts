import { Router } from "express";

import UserRouter from "./user.rout";
import authRoter from "./auth.rout";

const router=Router();

// Define your routes here
 

    router.use('/users', UserRouter);
    router.use('/auth', authRoter);

export default router;