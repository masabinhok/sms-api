import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ContactInquiryDto } from './dtos/contact-inquiry.dto';
import { ScheduleVisitDto } from './dtos/schedule-visit.dto';
import { BrochureRequestDto } from './dtos/brochure-request.dto';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  private readonly adminEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('EMAIL_SERVICE') private emailClient: ClientKafkaProxy,
    private readonly configService: ConfigService,
  ) {
    // Get admin email from config or use default
    this.adminEmail = this.configService.get('ADMIN_EMAIL') || 'admin@school.edu';
  }

  async onModuleInit() {
    try {
      // Connect to Kafka topics
      this.emailClient.subscribeToResponseOf('email.send');
      await this.emailClient.connect();
      this.logger.log('Successfully connected to Kafka email service');
    } catch (error) {
      this.logger.error(`Failed to connect to Kafka email service: ${error.message}`);
    }
  }

  async handleContactInquiry(dto: ContactInquiryDto) {
    try {
      // Store inquiry in database
      const inquiry = await this.prisma.contactInquiry.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          subject: dto.subject,
          message: dto.message,
        },
      });

      this.logger.log(`Contact inquiry created: ${inquiry.id}`);

      // Send email notification to school admin
      this.logger.log(`Sending contact inquiry notification email to ${this.adminEmail}`);
      this.emailClient.emit('email.send', {
        to: this.adminEmail,
        subject: `New Contact Inquiry: ${dto.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Contact Inquiry</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${dto.name}</p>
              <p><strong>Email:</strong> ${dto.email}</p>
              <p><strong>Phone:</strong> ${dto.phone}</p>
              <p><strong>Subject:</strong> ${dto.subject}</p>
              <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
            </div>
            <div style="background: #fff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6;">${dto.message}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
              This is an automated notification from the School Management System.
            </p>
          </div>
        `,
      });

      // Send confirmation email to the person who submitted
      this.logger.log(`Sending contact inquiry confirmation email to ${dto.email}`);
      this.emailClient.emit('email.send', {
        to: dto.email,
        subject: 'Thank you for contacting us!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Thank You for Your Inquiry!</h2>
            <p>Dear ${dto.name},</p>
            <p>We have received your inquiry regarding: <strong>${dto.subject}</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Reference ID:</strong> ${inquiry.id}</p>
              <p style="color: #7f8c8d; margin-bottom: 0;">Please keep this reference ID for future correspondence.</p>
            </div>
            <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
            <p>If you have any urgent concerns, please feel free to call us directly at our main office.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>School Administration Team</strong></p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              This is an automated confirmation email. Please do not reply to this message.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: 'Thank you for your inquiry! We will get back to you soon.',
        inquiryId: inquiry.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create contact inquiry: ${error.message}`);
      throw error;
    }
  }

  async handleScheduleVisit(dto: ScheduleVisitDto) {
    try {
      // Store visit request in database
      const visitRequest = await this.prisma.visitRequest.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          preferredDate: dto.preferredDate,
          preferredTime: dto.preferredTime,
          numberOfVisitors: dto.numberOfVisitors,
          notes: dto.notes,
        },
      });

      this.logger.log(`Visit request created: ${visitRequest.id}`);

      // Notify school admin with visit details
      this.logger.log(`Sending visit request notification email to ${this.adminEmail}`);
      this.emailClient.emit('email.send', {
        to: this.adminEmail,
        subject: `New Campus Visit Request - ${dto.preferredDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Campus Visit Request</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Visitor Name:</strong> ${dto.name}</p>
              <p><strong>Email:</strong> ${dto.email}</p>
              <p><strong>Phone:</strong> ${dto.phone}</p>
              <p><strong>Preferred Date:</strong> ${dto.preferredDate}</p>
              <p><strong>Preferred Time:</strong> ${dto.preferredTime}</p>
              <p><strong>Number of Visitors:</strong> ${dto.numberOfVisitors}</p>
              <p><strong>Visit ID:</strong> ${visitRequest.id}</p>
            </div>
            ${dto.notes ? `
              <div style="background: #fff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Additional Notes:</h3>
                <p style="line-height: 1.6;">${dto.notes}</p>
              </div>
            ` : ''}
            <p style="color: #e74c3c; font-weight: bold;">
              ⚠️ Please confirm or reschedule this visit request as soon as possible.
            </p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
              This is an automated notification from the School Management System.
            </p>
          </div>
        `,
      });

      // Send confirmation email to visitor
      this.logger.log(`Sending visit request confirmation email to ${dto.email}`);
      this.emailClient.emit('email.send', {
        to: dto.email,
        subject: 'Campus Visit Request Received - Confirmation Pending',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Campus Visit Request Received!</h2>
            <p>Dear ${dto.name},</p>
            <p>Thank you for your interest in visiting our campus! We have received your visit request with the following details:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Preferred Date:</strong> ${dto.preferredDate}</p>
              <p><strong>Preferred Time:</strong> ${dto.preferredTime}</p>
              <p><strong>Number of Visitors:</strong> ${dto.numberOfVisitors}</p>
              <p><strong>Reference ID:</strong> ${visitRequest.id}</p>
            </div>
            ${dto.notes ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0;"><strong>Your Notes:</strong> ${dto.notes}</p>
              </div>
            ` : ''}
            <p>Our admissions team will review your request and contact you within 24 hours to confirm the visit or suggest alternative timings.</p>
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📍 What to expect during your visit:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Campus tour</li>
                <li>Meeting with academic staff</li>
                <li>Information about programs and facilities</li>
                <li>Q&A session</li>
              </ul>
            </div>
            <p>We look forward to welcoming you to our campus!</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>Admissions Team</strong></p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              This is an automated confirmation email. Please do not reply to this message.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: 'Your visit has been scheduled! You will receive a confirmation email shortly.',
        visitId: visitRequest.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create visit request: ${error.message}`);
      throw error;
    }
  }

  async handleBrochureRequest(dto: BrochureRequestDto) {
    try {
      // Store brochure request in database
      const brochureRequest = await this.prisma.brochureRequest.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
        },
      });

      this.logger.log(`Brochure request created: ${brochureRequest.id}`);

      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:4000';
      const brochureUrl = `${frontendUrl}/downloads/school-brochure.pdf`;

      // Send brochure PDF link via email to requester
      this.logger.log(`Sending brochure email to ${dto.email}`);
      this.emailClient.emit('email.send', {
        to: dto.email,
        subject: '📚 Your School Brochure is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Thank You for Your Interest!</h2>
            <p>Dear ${dto.name},</p>
            <p>Thank you for requesting our school brochure. You can download it using the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${brochureUrl}" 
                 style="display: inline-block; padding: 15px 30px; background: #3498db; color: white; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                📥 Download Brochure
              </a>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Direct Link:</strong></p>
              <p style="word-break: break-all; color: #3498db; margin: 5px 0;">${brochureUrl}</p>
            </div>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p style="margin: 0;"><strong>📌 What's inside:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Complete program details</li>
                <li>Campus facilities and infrastructure</li>
                <li>Admission requirements and process</li>
                <li>Fee structure and scholarships</li>
                <li>Student life and activities</li>
              </ul>
            </div>
            <p>If you have any questions or would like to schedule a campus visit, please don't hesitate to contact us.</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Next Steps:</strong></p>
              <p style="margin: 5px 0;">Schedule a campus visit to experience our facilities firsthand!</p>
            </div>
            <p style="margin-top: 30px;">Best regards,<br><strong>Admissions Team</strong></p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              Reference ID: ${brochureRequest.id}<br>
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      });

      // Optional: Notify admin about brochure download for analytics/follow-up
      this.logger.log(`Sending brochure request notification to ${this.adminEmail}`);
      this.emailClient.emit('email.send', {
        to: this.adminEmail,
        subject: '📊 New Brochure Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h3 style="color: #2c3e50;">New Brochure Download Request</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <p><strong>Name:</strong> ${dto.name}</p>
              <p><strong>Email:</strong> ${dto.email}</p>
              <p><strong>Phone:</strong> ${dto.phone}</p>
              <p><strong>Request ID:</strong> ${brochureRequest.id}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
              Consider following up within 3-5 days to gauge interest.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: 'Thank you! The brochure has been sent to your email.',
        downloadUrl: '/downloads/school-brochure.pdf',
        requestId: brochureRequest.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create brochure request: ${error.message}`);
      throw error;
    }
  }

  // Analytics methods
  async getContactInquiryStats() {
    const total = await this.prisma.contactInquiry.count();
    const pending = await this.prisma.contactInquiry.count({
      where: { status: 'pending' },
    });
    const resolved = await this.prisma.contactInquiry.count({
      where: { status: 'resolved' },
    });

    return { total, pending, resolved };
  }

  async getVisitRequestStats() {
    const total = await this.prisma.visitRequest.count();
    const pending = await this.prisma.visitRequest.count({
      where: { status: 'pending' },
    });
    const confirmed = await this.prisma.visitRequest.count({
      where: { status: 'confirmed' },
    });

    return { total, pending, confirmed };
  }

  async getBrochureRequestStats() {
    const total = await this.prisma.brochureRequest.count();
    const last30Days = await this.prisma.brochureRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return { total, last30Days };
  }
}
