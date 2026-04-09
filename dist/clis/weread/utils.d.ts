/**
 * WeRead shared helpers: fetch wrappers and formatting.
 *
 * Two API domains:
 * - WEB_API (weread.qq.com/web/*): public, Node.js fetch
 * - API (i.weread.qq.com/*): private, Node.js fetch with cookies from browser
 */
import type { IPage } from '../../types.js';
export declare const WEREAD_DOMAIN = "weread.qq.com";
export declare const WEREAD_WEB_ORIGIN = "https://weread.qq.com";
export declare const WEREAD_SHELF_URL = "https://weread.qq.com/web/shelf";
export declare const WEREAD_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
export interface WebShelfRawBook {
    bookId?: string;
    title?: string;
    author?: string;
}
export interface WebShelfIndexEntry {
    bookId?: string;
    idx?: number;
    role?: string;
}
export interface WebShelfSnapshot {
    cacheFound: boolean;
    rawBooks: WebShelfRawBook[];
    shelfIndexes: WebShelfIndexEntry[];
}
export interface WebShelfEntry {
    bookId: string;
    title: string;
    author: string;
    readerUrl: string;
}
export interface WebShelfReaderResolution {
    snapshot: WebShelfSnapshot;
    readerUrl: string | null;
}
/**
 * Fetch a public WeRead web endpoint (Node.js direct fetch).
 * Used by search and ranking commands (browser: false).
 */
export declare function fetchWebApi(path: string, params?: Record<string, string>): Promise<any>;
/**
 * Fetch a private WeRead API endpoint with cookies extracted from the browser.
 * The HTTP request itself runs in Node.js to avoid page-context CORS failures.
 *
 * Cookies are collected from both the API subdomain (i.weread.qq.com) and the
 * main domain (weread.qq.com). WeRead may set auth cookies as host-only on
 * weread.qq.com, which won't match i.weread.qq.com in a URL-based lookup.
 */
export declare function fetchPrivateApi(page: IPage, path: string, params?: Record<string, string>): Promise<any>;
/**
 * Build stable shelf records from the web cache plus optional rendered reader URLs.
 * We only trust shelfIndexes when it fully covers the same bookId set as rawBooks;
 * otherwise we keep rawBooks order to avoid partial hydration reordering entries.
 */
export declare function buildWebShelfEntries(snapshot: WebShelfSnapshot, readerUrls?: string[]): WebShelfEntry[];
/**
 * Read the structured shelf cache from the WeRead shelf page.
 * The page hydrates localStorage asynchronously, so we poll briefly before
 * giving up and treating the cache as unavailable for the current session.
 */
export declare function loadWebShelfSnapshot(page: IPage): Promise<WebShelfSnapshot>;
/**
 * Resolve a shelf bookId to the current web reader URL by pairing structured
 * shelf cache order with the visible shelf links rendered on the page.
 */
export declare function resolveShelfReaderUrl(page: IPage, bookId: string): Promise<string | null>;
/**
 * Resolve the current reader URL for a shelf entry and return the parsed shelf
 * snapshot used during resolution, so callers can reuse cached title/author
 * metadata without loading the shelf page twice.
 */
export declare function resolveShelfReader(page: IPage, bookId: string): Promise<WebShelfReaderResolution>;
/** Format a Unix timestamp (seconds) to YYYY-MM-DD in UTC+8. Returns '-' for invalid input. */
export declare function formatDate(ts: number | undefined | null): string;
