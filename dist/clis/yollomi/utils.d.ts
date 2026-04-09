/**
 * Yollomi API utilities — browser cookie strategy.
 *
 * Uses the same per-model API routes as the Yollomi frontend:
 *   POST /api/ai/<model>   — image generation (session cookie auth)
 *   POST /api/ai/video     — video generation (session cookie auth)
 *
 * Auth: browser session cookies from NextAuth — just log in to yollomi.com in Chrome.
 */
import type { IPage } from '../../types.js';
export declare const YOLLOMI_DOMAIN = "yollomi.com";
/**
 * Ensure the browser tab is on yollomi.com.
 * The framework pre-nav sometimes silently fails, leaving the page on about:blank.
 */
export declare function ensureOnYollomi(page: IPage): Promise<void>;
/**
 * POST to a Yollomi /api/ai/* route via the browser session.
 * Uses relative paths (e.g. `/api/ai/flux`) — same as the frontend.
 */
export declare function yollomiPost(page: IPage, apiPath: string, body: Record<string, unknown>): Promise<any>;
/**
 * Resolve an image input: local file → base64 data URL, URL → as-is.
 */
export declare function resolveImageInput(input: string): string;
export declare function downloadOutput(url: string, outputDir: string, filename: string): Promise<{
    path: string;
    size: number;
}>;
export declare function fmtBytes(bytes: number): string;
/** Per-model API route mapping (matches frontend model.apiEndpoint). */
export declare const MODEL_ROUTES: Record<string, string>;
/** Well-known image model IDs and their credit costs. */
export declare const IMAGE_MODELS: Record<string, {
    credits: number;
    description: string;
}>;
export declare const VIDEO_MODELS: Record<string, {
    credits: number;
    description: string;
}>;
export declare const TOOL_MODELS: Record<string, {
    credits: number;
    description: string;
}>;
