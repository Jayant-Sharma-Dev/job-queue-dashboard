var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service.js";
import { JobStatus } from "./dto/update-job-status.dto.js";
let JobsService = class JobsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createJobDto) {
        return this.prisma.job.create({
            data: {
                title: createJobDto.title,
                type: createJobDto.type,
                status: 'PENDING',
            },
        });
    }
    async findAll() {
        return this.prisma.job.findMany();
    }
    async updateStatus(id, updateJobStatusDto) {
        const job = await this.prisma.job.findUnique({ where: { id } });
        if (!job) {
            throw new NotFoundException(`Job with id ${id} not found`);
        }
        const allowedTransitions = {
            [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.FAILED],
            [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
            [JobStatus.COMPLETED]: [],
            [JobStatus.FAILED]: [],
        };
        const currentStatus = job.status;
        const nextStatus = updateJobStatusDto.status;
        if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
            throw new BadRequestException(`Cannot transition from ${currentStatus} to ${nextStatus}`);
        }
        const result = await this.prisma.job.updateMany({
            where: {
                id,
                status: currentStatus,
            },
            data: {
                status: nextStatus,
            },
        });
        if (result.count === 0) {
            throw new BadRequestException(`Job status has already changed. Expected ${currentStatus} but found something else`);
        }
        return this.prisma.job.findUniqueOrThrow({ where: { id } });
    }
    async remove(id) {
        const job = await this.prisma.job.findUnique({ where: { id } });
        if (!job) {
            throw new NotFoundException(`Job with id ${id} not found`);
        }
        await this.prisma.job.delete({ where: { id } });
    }
};
JobsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], JobsService);
export { JobsService };
//# sourceMappingURL=jobs.service.js.map