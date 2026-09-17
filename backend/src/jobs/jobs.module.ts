import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.ts';
import { JobsController } from './jobs.controller.ts';
import { PrismaModule } from '../../prisma/prisma.module.ts';

@Module({
  imports: [PrismaModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}