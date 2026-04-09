import type { IPage } from '../../types.js';
/**
 * Create a minimal page mock with only the methods commonly used by Pixiv adapters.
 *
 * Since all TS adapters now go through `pixivFetch` which calls `page.evaluate`,
 * the evaluate results should match the raw Pixiv Ajax response format:
 * - Success: `{ body: ... }` (pixivFetch returns the `body` field)
 * - HTTP error: `{ __httpError: <status> }` (pixivFetch detects and throws)
 *
 * Additional methods can be overridden via the overrides parameter.
 */
export declare function createPageMock(evaluateResults: any[], overrides?: Partial<IPage>): IPage;
