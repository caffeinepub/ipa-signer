import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SigningJob {
    status: JobStatus;
    ipaFilename: string;
    certificateName: string;
}
export type Time = bigint;
export interface Certificate {
    expiryDate: Time;
    name: string;
}
export enum JobStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export interface backendInterface {
    addCertificate(name: string, expiryDate: Time): Promise<void>;
    getAllJobs(): Promise<Array<SigningJob>>;
    getAllJobsByCertificate(): Promise<Array<SigningJob>>;
    getCertificates(): Promise<Array<Certificate>>;
    getJobStatus(jobId: string): Promise<JobStatus>;
    submitSigningJob(ipaFilename: string, certificateName: string): Promise<string>;
    updateJobStatus(jobId: string, newStatus: JobStatus): Promise<void>;
}
