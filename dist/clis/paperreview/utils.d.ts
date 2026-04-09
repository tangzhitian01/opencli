export declare const PAPERREVIEW_DOMAIN = "paperreview.ai";
export declare const PAPERREVIEW_BASE_URL = "https://paperreview.ai";
export declare const MAX_PDF_BYTES: number;
export interface PaperreviewPdfFile {
    buffer: Buffer;
    fileName: string;
    resolvedPath: string;
    sizeBytes: number;
}
export interface PaperreviewRequestResult {
    response: Response;
    payload: any;
}
export declare function buildReviewUrl(token: string): string;
export declare function parseYesNo(value: unknown, name: string): boolean;
export declare function normalizeVenue(value: unknown): string;
export declare function validateHelpfulness(value: unknown): number;
export declare function readPdfFile(inputPath: unknown): Promise<PaperreviewPdfFile>;
export declare function requestJson(pathname: string, init?: RequestInit): Promise<PaperreviewRequestResult>;
export declare function ensureSuccess(response: Response, payload: unknown, fallback: string, hint?: string): void;
export declare function ensureApiSuccess(payload: unknown, fallback: string, hint?: string): void;
export declare function createUploadForm(urlData: {
    presigned_fields?: Record<string, string>;
}, pdfFile: PaperreviewPdfFile): FormData;
export declare function uploadPresignedPdf(presignedUrl: string, pdfFile: PaperreviewPdfFile, urlData: {
    presigned_fields?: Record<string, string>;
}): Promise<void>;
export declare function summarizeSubmission(options: {
    pdfFile: PaperreviewPdfFile;
    email: string;
    venue: string;
    token?: string;
    message?: string;
    s3Key?: string;
    dryRun?: boolean;
    status?: string;
}): Record<string, unknown>;
export declare function summarizeReview(token: string, payload: any, status?: string): Record<string, unknown>;
export declare function summarizeFeedback(options: {
    token: string;
    helpfulness: number;
    criticalError: boolean;
    actionableSuggestions: boolean;
    comments: string;
    payload: any;
}): Record<string, unknown>;
