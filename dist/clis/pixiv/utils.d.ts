/**
 * Pixiv shared helpers: authenticated Ajax fetch with standard error handling.
 *
 * All Pixiv Ajax APIs return `{ error: false, body: ... }` on success.
 * On failure the HTTP status code is used to distinguish auth (401/403),
 * not-found (404), and other errors.
 */
import type { IPage } from '../../types.js';
/**
 * Navigate to Pixiv (to attach cookies) then fetch a Pixiv Ajax API endpoint.
 *
 * Handles the common navigate → evaluate(fetch) → error-check pattern used
 * by every Pixiv TS adapter.
 *
 * @param page  - Browser page instance
 * @param path  - API path, e.g. '/ajax/illust/12345'
 * @param opts  - Optional query params
 * @returns     - The parsed `body` from the JSON response
 * @throws AuthRequiredError on 401/403
 * @throws CommandExecutionError on 404 or other HTTP errors
 */
export declare function pixivFetch(page: IPage, path: string, opts?: {
    params?: Record<string, string | number>;
    notFoundMsg?: string;
}): Promise<any>;
/** Maximum number of illust IDs per batch detail request (Pixiv server limit). */
export declare const BATCH_SIZE = 48;
