/**
 * TOS (ByteDance Object Storage) multipart uploader with resume support.
 *
 * Uses AWS Signature V4 (HMAC-SHA256) with STS2 temporary credentials.
 * For the init multipart upload call, the pre-computed auth from TosUploadInfo is used.
 * For PUT part uploads and the final complete call, AWS4 is computed from STS2 credentials.
 */
import type { Sts2Credentials, TosUploadInfo } from './types.js';
export interface TosUploadOptions {
    filePath: string;
    uploadInfo: TosUploadInfo;
    credentials: Sts2Credentials;
    onProgress?: (uploaded: number, total: number) => void;
}
interface ResumePart {
    partNumber: number;
    etag: string;
}
interface ResumeState {
    uploadId: string;
    fileSize: number;
    parts: ResumePart[];
}
declare const PART_SIZE: number;
declare const RESUME_DIR: string;
declare function getResumeFilePath(filePath: string): string;
declare function loadResumeState(resumePath: string, fileSize: number): ResumeState | null;
declare function saveResumeState(resumePath: string, state: ResumeState): void;
declare function deleteResumeState(resumePath: string): void;
declare function extractRegionFromHost(host: string): string;
interface SignedHeaders {
    [key: string]: string;
}
/**
 * Compute AWS Signature V4 headers for a TOS request.
 * Returns a Record of all headers to include (including Authorization, x-amz-date, etc.)
 */
declare function computeAws4Headers(opts: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: Buffer | string;
    credentials: Sts2Credentials;
    service: string;
    region: string;
    datetime: string;
}): SignedHeaders;
type ReadSyncFn = (fd: number, buffer: Buffer, offset: number, length: number, position: number) => number;
/** @internal — for testing only */
export declare function setReadSyncOverride(fn: ReadSyncFn | null): void;
export declare function tosUpload(options: TosUploadOptions): Promise<void>;
export { PART_SIZE, RESUME_DIR, extractRegionFromHost, getResumeFilePath, loadResumeState, saveResumeState, deleteResumeState, computeAws4Headers, };
export type { ResumeState, ResumePart };
