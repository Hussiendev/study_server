"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../ ../.env') });
exports.default = {
    NODE_ENV: process.env.NODE_ENV || 'development', // Checks if the environment type (e.g., 'production' or 'development') is set; if not, it uses 'development' as default.
    logDir: 'logs', // Specifies the folder where log files will be saved.
    port: process.env.PORT ? parseInt(process.env.PORT) : 4000, // Sets the port number for the application to listen on. It checks if a PORT environment variable is set; if not, it defaults to 3000.
    host: process.env.HOST || 'localhost', // Sets the host address for the application. It checks if a HOST environment variable is set; if not, it defaults to 'localhost'.
    Storage: {
        postgres: 'postgresql://neondb_owner:npg_Q0eGUgSc9bYx@ep-still-violet-a4smcvre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    },
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiry: process.env.JWT_EXPIRY || '24h'
    },
    // Brevo Email Service Configuration
    brevo: {
        apiKey: process.env.BREVO_API_KEY || '',
        senderEmail: process.env.SENDER_EMAIL || 'noreply@yourapp.com',
        senderName: process.env.SENDER_NAME || 'Your App'
    },
    // Base URL for email links
    baseUrl: process.env.BASE_URL || 'http://localhost:4000'
};
//# sourceMappingURL=index.js.map