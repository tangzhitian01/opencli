/**
 * Shared YouTube utilities — URL parsing, video ID extraction, etc.
 */
import type { IPage } from '../../types.js';
/**
 * Extract a YouTube video ID from a URL or bare video ID string.
 * Supports: watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/
 */
export declare function parseVideoId(input: string): string;
/**
 * Extract a JSON object assigned to a known bootstrap variable inside YouTube HTML.
 */
export declare function extractJsonAssignmentFromHtml(html: string, keys: string | string[]): Record<string, unknown> | null;
/**
 * Prepare a quiet YouTube API-capable page without opening the watch UI.
 */
export declare function prepareYoutubeApiPage(page: IPage): Promise<void>;
