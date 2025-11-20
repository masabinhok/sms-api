import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { handleSendCredentialsDto } from 'apps/libs/dtos/handle-send-credentials.dto';
import { 
  InternalServerErrorException, 
  BadRequestException 
} from 'apps/libs/exceptions';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly mailerService: MailerService) {}

    /**
     * Generic email sender
     */
    async sendEmail(options: {
        to: string;
        subject: string;
        html?: string;
        text?: string;
        template?: string;
        context?: Record<string, any>;
    }) {
        try {
            this.logger.log(`Sending email to ${options.to} | Subject: ${options.subject}`);
            const result = await this.mailerService.sendMail(options);
            this.logger.log(`Email sent successfully to ${options.to}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
            throw new InternalServerErrorException('Email sending failed', {
                recipient: options.to,
                reason: error.message,
            });
        }
    }

    /**
     * Send credentials email (account creation)
     */
    async handleSendCredentials(data: handleSendCredentialsDto) {
        const { email, username, password, fullName } = data;
        return this.sendEmail({
            to: email,
            subject: '🎓 Welcome to SMS - Your Account Credentials',
            text: this.generateTextTemplate(fullName, username, password),
            html: this.generateHtmlTemplate(fullName, username, password),
        });
    }

    /**
     * Send forgot password email (with reset link or temp password)
     */
    async handleForgotPassword(data: { email: string; resetLink?: string; tempPassword?: string }) {
        const { email, resetLink, tempPassword } = data;
        let subject = '🔑 Password Reset Request';
        let html = '';
        let text = '';
        if (resetLink) {
            subject = '🔑 Password Reset Link';
            html = this.generateForgotPasswordHtmlWithLink(resetLink);
            text = this.generateForgotPasswordTextWithLink(resetLink);
        } else if (tempPassword) {
            subject = '🔑 Password Reset - Your Temporary Password';
            html = this.generateForgotPasswordHtmlWithTempPassword(tempPassword);
            text = this.generateForgotPasswordTextWithTempPassword(tempPassword);
        } else {
            throw new BadRequestException('Must provide either resetLink or tempPassword');
        }
        return this.sendEmail({
            to: email,
            subject,
            html,
            text,
        });
    }

    // --- TEMPLATES ---

    private generateTextTemplate(fullName: string, username: string, password: string): string {
        return `
Hello ${fullName},

🎉 Welcome to the School Management System!

Your account has been created successfully. Here are your login credentials:

👤 Username: ${username}
🔑 Password: ${password}

🔒 IMPORTANT SECURITY NOTICE:
- Please change your password after your first login
- Keep your credentials confidential
- Do not share your login details with anyone

📱 You can access the system at: [Your School Portal URL]

If you have any questions or need assistance, please contact our support team.

Best regards,
The School Management Team

---
This is an automated message. Please do not reply to this email.
        `.trim();
    }

    private generateHtmlTemplate(fullName: string, username: string, password: string): string {
        return `
...existing code...
        `.trim();
    }

    private generateForgotPasswordTextWithLink(resetLink: string): string {
        return `
You requested a password reset for your School Management System account.

Please click the link below to reset your password:
${resetLink}

If you did not request this, you can ignore this email.

Best regards,
The School Management Team
        `.trim();
    }

    private generateForgotPasswordHtmlWithLink(resetLink: string): string {
        return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your School Management System account.</p>
    <p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#28a745;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
    </p>
    <p>If you did not request this, you can ignore this email.</p>
    <p style="color:#888;font-size:12px;">This is an automated message. Please do not reply.</p>
</div>
        `.trim();
    }

    private generateForgotPasswordTextWithTempPassword(tempPassword: string): string {
        return `
You requested a password reset for your School Management System account.

Here is your temporary password: ${tempPassword}

Please log in and change your password immediately.

If you did not request this, you can ignore this email.

Best regards,
The School Management Team
        `.trim();
    }

    private generateForgotPasswordHtmlWithTempPassword(tempPassword: string): string {
        return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your School Management System account.</p>
    <div style="margin:20px 0;padding:16px;background:#f8f9fa;border-radius:8px;border:1px solid #28a745;display:inline-block;">
        <strong>Temporary Password:</strong> <span style="font-family:monospace;">${tempPassword}</span>
    </div>
    <p>Please log in and change your password immediately.</p>
    <p>If you did not request this, you can ignore this email.</p>
    <p style="color:#888;font-size:12px;">This is an automated message. Please do not reply.</p>
</div>
        `.trim();
    }
}
