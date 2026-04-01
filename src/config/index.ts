import dotnev from "dotenv";
import { StringValue } from "ms";

dotnev.config();

// Parse port safely
const rawPort = process.env.PORT;
const port = rawPort ? parseInt(rawPort, 10) : 4000;

if (isNaN(port)) {
  console.error(`Invalid PORT environment variable: "${rawPort}"`);
  process.exit(1);
}

export default {
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "production",
  is_Production: process.env.NODE_ENV === "production",
  logDir: "logs",
  port, // Now guaranteed to be a valid number
  host: process.env.HOST || "localhost",
  geminiApiKey: process.env.GEMINI_API_KEY,
  Storage: {
    postgres: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "secret_90909090",
    RefreshSecret: process.env.JWT_REFRESH_SECRET || "secret_90909090",
    expiration: (process.env.JWT_EXPIRATION || "15m") as StringValue,
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION || "7d") as StringValue,
    resetExpiration: (process.env.JWT_REFRESH_EXPIRATION || "15min") as StringValue,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
};