import { JobsService } from './jobs.service.ts';
import { CreateJobDto } from './dto/create-job.dto.ts';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.ts';
import { Job } from './entities/job.entity.ts';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto): Promise<Job>;
    findAll(): Promise<Job[]>;
    updateStatus(id: number, updateJobStatusDto: UpdateJobStatusDto): Promise<Job>;
    remove(id: number): Promise<void>;
}
