import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { handleSendCredentialsDto } from 'apps/libs/dtos/handle-send-credentials.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  
  constructor(private readonly mailerService: MailerService) {}

  async handleSendCredentials(data: handleSendCredentialsDto) {
    try {
      const { email, username, password, fullName } = data;
      
      this.logger.log(`Sending credentials to ${email} for user ${fullName}`);
      
      const result = await this.mailerService.sendMail({
        to: email,
        subject: '🎓 Welcome to SMS - Your Account Credentials',
        text: this.generateTextTemplate(fullName, username, password),
        html: this.generateHtmlTemplate(fullName, username, password),
      });

      this.logger.log(`Credentials email sent successfully to ${email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error(`Failed to send credentials email to ${data.email}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

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
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SMS - Your Account Credentials</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 15px; 
            overflow: hidden; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .welcome-message { 
            font-size: 18px; 
            margin-bottom: 30px; 
            color: #555; 
        }
        .credentials-section { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            border: 2px solid #28a745; 
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0; 
            text-align: center; 
        }
        .credentials-title { 
            font-size: 20px; 
            font-weight: 600; 
            color: #28a745; 
            margin-bottom: 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
        }
        .credential-item { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 15px 0; 
            font-size: 16px; 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
        }
        .credential-label { 
            font-weight: 600; 
            margin-right: 15px; 
            min-width: 80px; 
            text-align: right; 
        }
        .credential-value { 
            font-family: 'Courier New', monospace; 
            background: #f8f9fa; 
            padding: 8px 12px; 
            border-radius: 4px; 
            border: 1px solid #dee2e6; 
            font-size: 14px; 
            color: #495057; 
        }
        .icon { 
            font-size: 20px; 
            margin-right: 10px; 
        }
        .security-notice { 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            border: 1px solid #ffd93d; 
            border-radius: 10px; 
            padding: 20px; 
            margin: 25px 0; 
        }
        .security-notice h4 { 
            margin: 0 0 15px 0; 
            color: #856404; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        .security-notice ul { 
            margin: 0; 
            padding-left: 20px; 
        }
        .security-notice li { 
            margin-bottom: 8px; 
            color: #856404; 
        }
        .login-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); 
        }
        .login-button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4); 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #dee2e6; 
        }
        .footer p { 
            margin: 5px 0; 
            font-size: 12px; 
            color: #6c757d; 
        }
        .footer-brand { 
            font-weight: 600; 
            color: #495057; 
            font-size: 14px; 
        }
        .divider { 
            height: 2px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            margin: 30px 0; 
            border-radius: 1px; 
        }
        @media (max-width: 600px) {
            .email-container { 
                margin: 10px; 
                border-radius: 10px; 
            }
            .header { 
                padding: 30px 20px; 
            }
            .content { 
                padding: 30px 20px; 
            }
            .credential-item { 
                flex-direction: column; 
                text-align: center; 
            }
            .credential-label { 
                margin-right: 0; 
                margin-bottom: 5px; 
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎓 Welcome to SMS</h1>
            <p>Your account is ready to use!</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <strong>Hello ${fullName},</strong><br>
                🎉 Congratulations! Your account has been created successfully in our School Management System. We're excited to have you on board!
            </div>
            
            <div class="credentials-section">
                <div class="credentials-title">
                    🔐 Your Login Credentials
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">
                        <span class="icon">👤</span>Username:
                    </div>
                    <div class="credential-value">${username}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">
                        <span class="icon">🔑</span>Password:
                    </div>
                    <div class="credential-value">${password}</div>
                </div>
            </div>

            <div class="security-notice">
                <h4>🔒 Important Security Notice</h4>
                <ul>
                    <li><strong>Change your password</strong> after your first login</li>
                    <li><strong>Keep your credentials confidential</strong> - never share them with anyone</li>
                    <li><strong>Use a strong password</strong> with a mix of letters, numbers, and symbols</li>
                    <li><strong>Log out completely</strong> when using shared computers</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="#" class="login-button">🚀 Access School Portal</a>
            </div>

            <div class="divider"></div>

            <p style="text-align: center; color: #6c757d;">
                If you have any questions or need assistance, please don't hesitate to contact our support team. 
                We're here to help you get started! 🌟
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-brand">The School Management Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2025 School Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}
