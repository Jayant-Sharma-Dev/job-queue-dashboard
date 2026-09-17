import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.ts';
import { CreateJobDto } from './dto/create-job.dto.ts';
import { UpdateJobStatusDto, JobStatus } from './dto/update-job-status.dto.ts';
import { Job } from './entities/job.entity.ts';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  // CREATE a new job
  async create(createJobDto: CreateJobDto): Promise<Job> {
    return this.prisma.job.create({
      data: {
        title: createJobDto.title,
        type: createJobDto.type,
        status: 'PENDING',
      },
    });
  }

  // GET all jobs
  async findAll(): Promise<Job[]> {
    return this.prisma.job.findMany();
  }

  // UPDATE job status (with concurrency safety)
  async updateStatus(id: number, updateJobStatusDto: UpdateJobStatusDto): Promise<Job> {
    const job = await this.prisma.job.findUnique({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    // Define allowed status transitions
    const allowedTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.FAILED],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    const currentStatus = job.status;
    const nextStatus = updateJobStatusDto.status;

    // Check if transition is allowed
    if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${nextStatus}`,
      );
    }

    const now = new Date();
    const timestampData =
      nextStatus === JobStatus.RUNNING
        ? { startedAt: now }
        : nextStatus === JobStatus.COMPLETED || nextStatus === JobStatus.FAILED
          ? { completedAt: now }
          : {};

    // prevents two simultaneous requests both succeeding
    const result = await this.prisma.job.updateMany({
      where: { //..here wehere clause ensure only one succeeds
        id,
        status: currentStatus, // Only update if status hasn't changed
      },
      data: {
        status: nextStatus,
        ...timestampData,
      },
    });

    // If no rows were updated, something changed between our read and write
    if (result.count === 0) {
      throw new BadRequestException(
        `Job status has already changed. Expected ${currentStatus} but found something else`,
      );
    }

    // Return the updated job
    return this.prisma.job.findUniqueOrThrow({ where: { id } });
  }

  // DELETE a job
  async remove(id: number): Promise<void> {
    const job = await this.prisma.job.findUnique({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    await this.prisma.job.delete({ where: { id } });
  }
}