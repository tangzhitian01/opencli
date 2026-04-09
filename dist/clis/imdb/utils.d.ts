import type { IPage } from '../../types.js';
/**
 * Normalize an IMDb title or person input to a bare ID.
 * Accepts bare IDs, desktop URLs, mobile URLs, and URLs with language prefixes or query params.
 */
export declare function normalizeImdbId(input: string, prefix: 'tt' | 'nm'): string;
/**
 * Convert an ISO 8601 duration string to a short human-readable format for table display.
 * Example: PT2H28M -> 2h 28m.
 */
export declare function formatDuration(iso: string): string;
/**
 * Force an IMDb page URL to use the English language parameter,
 * reducing structural differences across localized pages.
 */
export declare function forceEnglishUrl(url: string): string;
/**
 * Normalize IMDb title-type payloads that may be represented as an object,
 * a raw string, or an empty text field with only an internal id.
 */
export declare function normalizeImdbTitleType(input: unknown): string;
/**
 * Extract structured JSON-LD data from the page.
 * Accepts a single type string or an array of types to match against @type.
 */
export declare function extractJsonLd(page: IPage, type?: string | string[]): Promise<Record<string, unknown> | null>;
/**
 * Poll until the current IMDb page path matches the expected entity/search path.
 */
export declare function waitForImdbPath(page: IPage, pathPattern: string, timeoutMs?: number): Promise<boolean>;
/**
 * Wait until IMDb search results (or the search UI state) has rendered.
 */
export declare function waitForImdbSearchReady(page: IPage, timeoutMs?: number): Promise<boolean>;
/**
 * Wait until IMDb review cards (or the page review summary) has rendered.
 */
export declare function waitForImdbReviewsReady(page: IPage, timeoutMs?: number): Promise<boolean>;
/**
 * Read the current IMDb entity id from the page URL/canonical metadata.
 */
export declare function getCurrentImdbId(page: IPage, prefix: 'tt' | 'nm'): Promise<string>;
/**
 * Detect whether the current page is an IMDb bot-challenge or verification page.
 */
export declare function isChallengePage(page: IPage): Promise<boolean>;
