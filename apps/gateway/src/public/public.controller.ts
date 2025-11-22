import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactInquiryDto } from './dtos/contact-inquiry.dto';
import { ScheduleVisitDto } from './dtos/schedule-visit.dto';
import { BrochureRequestDto } from './dtos/brochure-request.dto';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('contact-inquiry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit a contact inquiry',
    description: 'Handle contact form submissions from the homepage. Stores inquiry in database and sends notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inquiry submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Thank you for your inquiry! We will get back to you soon.' },
        inquiryId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
    },
  })
  async contactInquiry(@Body() dto: ContactInquiryDto) {
    return this.publicService.handleContactInquiry(dto);
  }

  @Post('schedule-visit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Schedule a campus visit',
    description: 'Handle campus visit scheduling requests. Stores visit request and sends confirmation emails.',
  })
  @ApiResponse({
    status: 200,
    description: 'Visit scheduled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Your visit has been scheduled! You will receive a confirmation email shortly.' },
        visitId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
      },
    },
  })
  async scheduleVisit(@Body() dto: ScheduleVisitDto) {
    return this.publicService.handleScheduleVisit(dto);
  }

  @Post('brochure-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request school brochure',
    description: 'Track brochure download requests for analytics. Sends brochure PDF link via email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Brochure request processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Thank you! The brochure has been sent to your email.' },
        downloadUrl: { type: 'string', example: '/downloads/school-brochure.pdf' },
        requestId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174002' },
      },
    },
  })
  async brochureRequest(@Body() dto: BrochureRequestDto) {
    return this.publicService.handleBrochureRequest(dto);
  }
}
