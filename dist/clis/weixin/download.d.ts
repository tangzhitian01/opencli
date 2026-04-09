/**
 * WeChat article download — export WeChat Official Account articles to Markdown.
 *
 * Ported from jackwener/wechat-article-to-markdown (JS version) to OpenCLI adapter.
 *
 * Usage:
 *   opencli weixin download --url "https://mp.weixin.qq.com/s/xxx" --output ./weixin
 */
/**
 * Normalize a pasted WeChat article URL.
 */
export declare function normalizeWechatUrl(raw: string): string;
/**
 * Format a WeChat article timestamp as a UTC+8 datetime string.
 * Accepts either Unix seconds or milliseconds.
 */
export declare function formatWechatTimestamp(rawTimestamp: string): string;
/**
 * Extract the raw create_time value from supported WeChat inline script formats.
 */
export declare function extractWechatCreateTimeValue(htmlStr: string): string;
/**
 * Extract the publish time from DOM text first, then fall back to numeric create_time values.
 */
export declare function extractWechatPublishTime(publishTimeText: string | null | undefined, htmlStr: string): string;
/**
 * Detect WeChat anti-bot / verification gate pages before we try to parse the article.
 */
export declare function detectWechatAccessIssue(pageText: string | null | undefined, htmlStr: string): string;
export declare function pickFirstWechatMetaText(...candidates: Array<string | null | undefined>): string;
/**
 * Build a self-contained helper for execution inside page.evaluate().
 */
export declare function buildExtractWechatPublishTimeJs(): string;
/**
 * Build a self-contained access-issue detector for execution inside page.evaluate().
 */
export declare function buildDetectWechatAccessIssueJs(): string;
