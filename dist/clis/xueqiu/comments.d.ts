import type { IPage } from '../../types.js';
/**
 * Minimal browser-response shape used by the classifier.
 */
export interface XueqiuCommentsResponse {
    status: number;
    contentType: string;
    json: unknown;
    textSnippet: string;
}
/**
 * Minimal normalized row shape used during pagination and deduplication.
 */
export interface XueqiuCommentRow {
    id: string;
    author: string;
    text?: string;
    likes?: number;
    replies?: number;
    retweets?: number;
    created_at?: string | null;
    url?: string | null;
}
/**
 * Public CLI row shape. This intentionally omits the internal stable ID used
 * only for deduplication, so machine-readable output matches the command
 * contract and table columns.
 */
export type XueqiuCommentOutputRow = Omit<XueqiuCommentRow, 'id'>;
/**
 * Pagination options for collecting enough rows to satisfy `--limit`.
 */
export interface CollectCommentRowsOptions {
    symbol: string;
    limit: number;
    pageSize: number;
    maxRequests: number;
    fetchPage: (pageNumber: number, pageSize: number) => Promise<XueqiuCommentsResponse>;
    warn?: (message: string) => void;
}
type XueqiuCommentsKind = 'auth' | 'anti-bot' | 'argument' | 'empty' | 'incompatible' | 'unknown';
/**
 * Extract the raw item list from one classified JSON payload.
 *
 * @param json Raw parsed JSON payload from browser fetch.
 * @returns Discussion items when the response shape is usable.
 */
export declare function getCommentItems(json: unknown): Record<string, any>[];
/**
 * Classify one raw browser response before command-level error handling.
 *
 * @param response Structured browser response payload.
 * @returns Tagged result describing the response class.
 */
export declare function classifyXueqiuCommentsResponse(response: XueqiuCommentsResponse): {
    kind: XueqiuCommentsKind;
};
/**
 * Merge one new page of rows while preserving the first occurrence of each ID.
 *
 * @param current Rows already collected.
 * @param incoming Rows from the next page.
 * @returns Deduplicated merged rows.
 */
export declare function mergeUniqueCommentRows(current: XueqiuCommentRow[], incoming: XueqiuCommentRow[]): XueqiuCommentRow[];
/**
 * Normalize one raw xueqiu discussion item into the CLI row shape.
 *
 * Returned rows represent stock-scoped discussion posts, not replies under
 * one parent post.
 *
 * @param item Raw API item.
 * @returns Cleaned CLI row.
 */
export declare function normalizeCommentItem(item: Record<string, any>): XueqiuCommentRow;
/**
 * Remove internal-only fields before returning rows to the CLI renderer.
 *
 * @param row Internal row shape used during pagination.
 * @returns Public output row that matches the documented command contract.
 */
export declare function toCommentOutputRow(row: XueqiuCommentRow): XueqiuCommentOutputRow;
/**
 * Convert response classification into a compact warning phrase.
 *
 * @param kind Classifier result kind.
 * @returns Human-readable reason fragment for stderr warnings.
 */
export declare function describeFailureKind(kind: XueqiuCommentsKind): string;
/**
 * Fetch one discussion page from inside the browser context so cookies and
 * any site-side request state stay attached to the request.
 *
 * @param page Active browser page.
 * @param symbol Normalized stock symbol.
 * @param pageNumber Internal page counter, starting from 1.
 * @param pageSize Item count per internal request.
 * @returns Structured response for command-side classification.
 */
export declare function fetchCommentsPage(page: IPage, symbol: string, pageNumber: number, pageSize: number): Promise<XueqiuCommentsResponse>;
/**
 * Collect enough stock discussion rows to satisfy the requested limit.
 *
 * This helper owns the internal pagination policy so the public command
 * contract can stay small and expose only `--limit`.
 *
 * @param options Pagination inputs and a page-fetch callback.
 * @returns Deduplicated normalized rows, possibly partial with a warning.
 */
export declare function collectCommentRows(options: CollectCommentRowsOptions): Promise<XueqiuCommentRow[]>;
/**
 * Convert raw CLI input into a normalized stock symbol.
 *
 * @param raw User-provided CLI argument.
 * @returns Upper-cased symbol string.
 */
export declare function normalizeSymbolInput(raw: unknown): string;
export {};
