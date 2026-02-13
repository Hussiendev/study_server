"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@yourapp.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Your App';
// Brevo API endpoint
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
/**
 * Send email using Brevo API
 * @param options - Email configuration
 *
 * How it works:
 * 1. Prepare email payload with sender, recipient, subject, and HTML content
 * 2. Send HTTP POST request to Brevo API
 * 3. Include API key in headers for authentication
 * 4. Log success or error
 */
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.info(`Sending email to ${options.to} with subject: ${options.subject}`);
            if (!BREVO_API_KEY) {
                logger_1.default.warn('BREVO_API_KEY is not configured. Email not sent.');
                return;
            }
            const payload = {
                sender: {
                    name: SENDER_NAME,
                    email: SENDER_EMAIL
                },
                to: [
                    {
                        email: options.to,
                        name: options.recipientName || 'User'
                    }
                ],
                subject: options.subject,
                htmlContent: options.htmlContent
            };
            const response = yield axios_1.default.post(BREVO_API_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': BREVO_API_KEY
                }
            });
            logger_1.default.info(`Email sent successfully to ${options.to}. Message ID: ${response.data.messageId}`);
        }
        catch (error) {
            logger_1.default.error(`Error sending email to ${options.to}`, error);
            // Don't throw error - log it but continue (graceful degradation)
            // In production, you might want to queue these for retry
        }
    });
}
/**
 * Send verification email
 * @param email - User email
 * @param verificationLink - Link to verify email
 * @param userName - User name for personalization
 */
function sendVerificationEmail(email, verificationLink, userName) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = `
        <h2>Welcome, ${userName}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p>
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify Email
            </a>
        </p>
        <p>Or copy this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
    `;
        yield sendEmail({
            to: email,
            subject: 'Verify Your Email Address',
            htmlContent,
            recipientName: userName
        });
    });
}
/**
 * Send password reset email
 * @param email - User email
 * @param resetLink - Link to reset password
 * @param userName - User name for personalization
 */
function sendPasswordResetEmail(email, resetLink, userName) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = `
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <p>
            <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Password
            </a>
        </p>
        <p>Or copy this link in your browser:</p>
        <p>${resetLink}</p>
        <p><strong>This link expires in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `;
        yield sendEmail({
            to: email,
            subject: 'Reset Your Password',
            htmlContent,
            recipientName: userName
        });
    });
}
/**
 * Send welcome email after successful registration
 * @param email - User email
 * @param userName - User name for personalization
 */
function sendWelcomeEmail(email, userName) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = `
        <h2>Welcome to Our Platform, ${userName}!</h2>
        <p>Your account has been successfully created and verified.</p>
        <p>You can now login to your account and start using our services.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy to have you on board!</p>
    `;
        yield sendEmail({
            to: email,
            subject: 'Welcome to Our Platform!',
            htmlContent,
            recipientName: userName
        });
    });
}
//# sourceMappingURL=emailService.js.map