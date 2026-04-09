/**
 * Transcode poller for Douyin video processing.
 *
 * After a video is uploaded via TOS and the "confirm upload" API is called,
 * Douyin transcodes the video asynchronously. This module polls the transcode
 * status endpoint until encode=2 (complete) or a timeout is reached.
 */
import type { IPage } from '../../../types.js';
import type { TranscodeResult } from './types.js';
type BrowserFetchFn = (page: IPage, method: 'GET' | 'POST', url: string) => Promise<unknown>;
/**
 * Lower-level poll function that accepts an injected fetch function.
 * Exported for testability.
 */
export declare function pollTranscodeWithFetch(fetchFn: BrowserFetchFn, page: IPage, videoId: string, timeoutMs?: number): Promise<TranscodeResult>;
/**
 * Poll Douyin's transcode status endpoint until the video is fully transcoded
 * (encode=2) or the timeout expires.
 *
 * @param page - Browser page for making credentialed API calls
 * @param videoId - The video_id returned from the confirm upload step
 * @param timeoutMs - Maximum wait time in ms (default: 300 000 = 5 minutes)
 * @returns TranscodeResult including duration, fps, dimensions, and poster info
 * @throws TimeoutError if transcode does not complete within timeoutMs
 */
export declare function pollTranscode(page: IPage, videoId: string, timeoutMs?: number): Promise<TranscodeResult>;
export {};
