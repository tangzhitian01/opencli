import type { IPage } from '../../../types.js';
export interface FetchOptions {
    body?: unknown;
    headers?: Record<string, string>;
}
/**
 * Execute a fetch() call inside the Chrome browser context via page.evaluate.
 * This ensures a_bogus signing and cookies are handled automatically by the browser.
 */
export declare function browserFetch(page: IPage, method: 'GET' | 'POST', url: string, options?: FetchOptions): Promise<unknown>;
