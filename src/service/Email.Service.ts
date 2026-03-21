import nodemailer from "nodemailer";
import config from "../config";

export class EmailService {

    private transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: false,
        auth: {
            user: config.mail.user,
            pass: config.mail.pass,
        },
    });

    async sendPasswordResetEmail(to: string, token: string) {

        await this.transporter.sendMail({
            from: `"StudySpark" <${config.mail.from}>`,
            to,
            subject: "Your Password Reset Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding:20px;">
                    <h2>Password Reset</h2>
                    <p>You requested a password reset.</p>
                    <p>Please use the following reset code:</p>

                    <div style="
                        font-size: 24px;
                        font-weight: bold;
                        background: #f3f4f6;
                        padding: 15px;
                        text-align: center;
                        letter-spacing: 3px;
                        border-radius: 8px;
                        margin: 20px 0;
                    ">
                        ${token}
                    </div>

                    <p>This code expires in 15 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
            text: `
Password Reset

You requested a password reset.

Your reset code is: ${token}

This code expires in 15 minutes.
            `
        });
    }
}