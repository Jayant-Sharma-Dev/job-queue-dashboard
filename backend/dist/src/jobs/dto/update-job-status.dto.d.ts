export declare enum JobStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class UpdateJobStatusDto {
    status: JobStatus;
}
