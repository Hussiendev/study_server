import "dotenv/config";
import logger from "./util/logger";
import config from "./config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from "cors";
import requestLogger from "./midlleware/requestLogger";
import router from "./routes/index";
import { HttpException } from "./util/exceptions/http/HttpException";
import { NotFoundException } from "./util/exceptions/http/NotFoundException";
import cookieParser from "cookie-parser";

const app = express();

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FIXED CORS CONFIGURATION - No wildcard, with credentials support
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL exactly
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(cookieParser());
app.use(requestLogger);

// -------------------------
// ROUTES
// -------------------------
app.use("/", router);

// -------------------------
// 404 HANDLER
// -------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundException("Route not found", {
        path: req.originalUrl
    }));
});

// -------------------------
// GLOBAL ERROR HANDLER
// -------------------------
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof HttpException) {

        logger.error(
            "%s [%d] \"%s\" %o",
            err.name,
            err.status,
            err.message,
            err.details || {}
        );

        return res.status(err.status).json({
            message: err.message,
            details: err.details || undefined
        });
    }

    // Unexpected error
    logger.error("Unhandled Error: %s\n%s", err.message, err.stack);

    return res.status(500).json({
        message: config.is_Production
            ? "Internal Server Error"
            : err.message
    });
});

// -------------------------
// START SERVER
// -------------------------
app.listen(config.port, config.host, () => {
    logger.info(`Server running at http://${config.host}:${config.port}`);
});