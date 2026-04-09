/**
 * Wikipedia adapter utilities.
 *
 * Uses the public MediaWiki REST API and Action API — no key required.
 * REST API: https://en.wikipedia.org/api/rest_v1/
 * Action API: https://en.wikipedia.org/w/api.php
 */
/** Maximum character length for article extract fields. */
export declare const EXTRACT_MAX_LEN = 300;
/** Maximum character length for short description fields. */
export declare const DESC_MAX_LEN = 80;
/** Response shape shared by /page/summary and /page/random/summary endpoints. */
export interface WikiSummary {
    title?: string;
    description?: string;
    extract?: string;
    content_urls?: {
        desktop?: {
            page?: string;
        };
    };
}
/** Article entry returned by the /feed/featured most-read endpoint. */
export interface WikiMostReadArticle {
    title?: string;
    description?: string;
    views?: number;
}
export declare function wikiFetch(lang: string, path: string): Promise<unknown>;
/** Map a WikiSummary API response to the standard output row. */
export declare function formatSummaryRow(data: WikiSummary, lang: string): {
    title: string;
    description: string;
    extract: string;
    url: string;
};
