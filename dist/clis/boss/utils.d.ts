/**
 * BOSS直聘 common utilities — shared logic for all boss adapters.
 *
 * Consolidates:
 * - Page navigation with cookie context
 * - XHR-based API calls (GET/POST) with automatic login state detection
 * - Cookie expiry error codes (code 7, 37)
 * - Verbose logging
 */
import type { IPage } from '../../types.js';
export interface BossApiResponse {
    code: number;
    message?: string;
    zpData?: any;
    [key: string]: any;
}
export interface FetchOptions {
    /** HTTP method, defaults to 'GET' */
    method?: 'GET' | 'POST';
    /** POST body (will be sent as application/x-www-form-urlencoded) */
    body?: string;
    /** XHR timeout in ms, defaults to 15000 */
    timeout?: number;
    /** If true, don't throw on non-zero code — return the raw response */
    allowNonZero?: boolean;
}
/**
 * Assert that page is available (non-null).
 */
export declare function requirePage(page: IPage | null): asserts page is IPage;
/**
 * Navigate to BOSS chat page and wait for it to settle.
 * This establishes the cookie context needed for subsequent API calls.
 */
export declare function navigateToChat(page: IPage, waitSeconds?: number): Promise<void>;
/**
 * Navigate to a custom BOSS page (for search/detail that use different pages).
 */
export declare function navigateTo(page: IPage, url: string, waitSeconds?: number): Promise<void>;
/**
 * Check if an API response indicates cookie expiry and throw a clear error.
 * Call this after every BOSS API response with a non-zero code.
 */
export declare function checkAuth(data: BossApiResponse): void;
/**
 * Throw if the API response is not code 0.
 * Checks for cookie expiry first, then throws with the provided message.
 */
export declare function assertOk(data: BossApiResponse, errorPrefix?: string): void;
/**
 * Make a credentialed XHR request via page.evaluate().
 *
 * This is the single XHR template — no more copy-pasting the same 15-line
 * XMLHttpRequest boilerplate across every adapter.
 *
 * @returns Parsed JSON response
 * @throws On network error, timeout, JSON parse failure, or cookie expiry
 */
export declare function bossFetch(page: IPage, url: string, opts?: FetchOptions): Promise<BossApiResponse>;
/**
 * Fetch the boss friend (chat) list.
 */
export declare function fetchFriendList(page: IPage, opts?: {
    pageNum?: number;
    jobId?: string;
}): Promise<any[]>;
/**
 * Fetch the recommended candidates (greetRecSortList).
 */
export declare function fetchRecommendList(page: IPage): Promise<any[]>;
/**
 * Find a friend by encryptUid, searching through friend list and optionally greet list.
 * Returns null if not found.
 */
export declare function findFriendByUid(page: IPage, encryptUid: string, opts?: {
    maxPages?: number;
    checkGreetList?: boolean;
}): Promise<any | null>;
/**
 * Click on a candidate in the chat list by their numeric UID.
 * @returns true if clicked, false if not found
 */
export declare function clickCandidateInList(page: IPage, numericUid: string | number): Promise<boolean>;
/**
 * Type a message into the chat editor and send it.
 * @returns true if sent successfully
 */
export declare function typeAndSendMessage(page: IPage, text: string): Promise<boolean>;
/**
 * Verbose log helper — prints when OPENCLI_VERBOSE or DEBUG=opencli is set.
 */
export declare function verbose(msg: string): void;
