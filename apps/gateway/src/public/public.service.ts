import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ContactInquiryDto } from './dtos/contact-inquiry.dto';
import { ScheduleVisitDto } from './dtos/schedule-visit.dto';
import { BrochureRequestDto } from './dtos/brochure-request.dto';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(private readonly prisma: PrismaService) {}

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

      // TODO: Send email notification to school admin
      // TODO: Send confirmation email to the person who submitted

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

      // TODO: Send confirmation email to visitor
      // TODO: Notify school admin with visit details

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

      // TODO: Send brochure PDF link via email to requester

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
