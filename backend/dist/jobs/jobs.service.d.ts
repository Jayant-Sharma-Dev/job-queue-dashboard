import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { Job } from './entities/job.entity.js';
export declare class JobsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createJobDto: CreateJobDto): Promise<Job>;
    findAll(): Promise<Job[]>;
    updateStatus(id: number, updateJobStatusDto: UpdateJobStatusDto): Promise<Job>;
    remove(id: number): Promise<void>;
}
