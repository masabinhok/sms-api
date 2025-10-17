import { Module } from '@nestjs/common';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service'

@Module({
 imports: [
     ConfigModule.forRoot({
       isGlobal: true,
       envFilePath: '.env'
     }),
   ],
  controllers: [AcademicsController],
  providers: [AcademicsService, PrismaService, ConfigService],
})
export class AcademicsModule {}
