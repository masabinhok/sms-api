import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateActivityDto } from 'apps/libs/dtos/create-activity.dto';
import { QueryActivityDto } from 'apps/libs/dtos/query-activity.dto';
import { Prisma } from '../generated/prisma';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  async createActivity(createActivityDto: CreateActivityDto) {
    try {
      const activity = await this.prisma.activity.create({
        data: createActivityDto,
      });
      return { success: true, data: activity };
    } catch (error) {
      this.logger.error('Failed to create activity log', error.stack, { userId: createActivityDto.userId });
      return { success: false, error: error.message };
    }
  }

  async getAllActivities(query: QueryActivityDto) {
    const {
      page = 1,
      limit = 20,
      userId,
      userRole,
      action,
      entityType,
      entityId,
      search,
      startDate,
      endDate,
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.ActivityWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (userRole) {
      where.userRole = userRole;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await this.prisma.activity.count({ where });

    // Get activities with pagination
    const activities = await this.prisma.activity.findMany({
      where,
      orderBy: { createdAt: order },
      skip,
      take: limit,
    });

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivityById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return { success: false, message: `Activity with ID ${id} not found` };
    }

    return { success: true, data: activity };
  }

  async getActivityStats() {
    const total = await this.prisma.activity.count();

    const byAction = await this.prisma.activity.groupBy({
      by: ['action'],
      _count: true,
    });

    const byEntityType = await this.prisma.activity.groupBy({
      by: ['entityType'],
      _count: true,
    });

    const byUserRole = await this.prisma.activity.groupBy({
      by: ['userRole'],
      _count: true,
    });

    // Get recent activities
    const recentActivities = await this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      total,
      byAction,
      byEntityType,
      byUserRole,
      recentActivities,
    };
  }
}
