/**
 * Shared Tieba parsing helpers used by the browser adapters.
 */
export declare const MAX_TIEBA_LIMIT = 20;
export interface RawTiebaPostCard {
    title?: string;
    author?: string;
    descInfo?: string;
    actionTexts?: string[];
    commentCount?: unknown;
    threadId?: unknown;
    url?: unknown;
}
export interface RawTiebaPagePcFeedEntry {
    layout?: string;
    feed?: {
        schema?: unknown;
        log_param?: Array<{
            key?: unknown;
            value?: unknown;
        }>;
        business_info_map?: Record<string, unknown>;
        components?: Array<Record<string, unknown>>;
    };
}
export interface TiebaPostItem {
    rank: number;
    title: string;
    author: string;
    replies: number;
    last_reply: string;
    id: string;
    url: string;
}
export interface RawTiebaSearchItem {
    title?: string;
    forum?: string;
    author?: string;
    time?: string;
    snippet?: string;
    id?: string;
    url?: string;
}
export interface TiebaSearchItem {
    rank: number;
    title: string;
    forum: string;
    author: string;
    time: string;
    snippet: string;
    id: string;
    url: string;
}
export interface RawTiebaMainPost {
    title?: string;
    author?: string;
    fallbackAuthor?: string;
    contentText?: string;
    structuredText?: string;
    visibleTime?: string;
    structuredTime?: unknown;
    hasMedia?: boolean;
}
export interface RawTiebaReply {
    floor?: unknown;
    author?: string;
    content?: string;
    time?: string;
}
export interface RawTiebaReadPayload {
    mainPost?: RawTiebaMainPost | null;
    replies?: RawTiebaReply[];
}
export interface TiebaReadItem {
    floor: number;
    author: string;
    content: string;
    time: string;
}
export interface TiebaReadBuildOptions {
    limit?: unknown;
    includeMainPost?: boolean;
}
/**
 * Keep the public CLI limit contract aligned with the real implementation.
 */
export declare function normalizeTiebaLimit(value: unknown, fallback?: number): number;
export declare function normalizeText(value: unknown): string;
/**
 * Match Tieba PC's signed request contract so forum list fetching stays stable.
 */
export declare function signTiebaPcParams(params: Record<string, string>): string;
export declare function parseTiebaCount(text: string): number;
export declare function parseTiebaLastReply(text: string): string;
/**
 * Convert Tieba's signed `page_pc` feed entries into the stable card shape used by the CLI.
 */
export declare function buildTiebaPostCardsFromPagePc(rawFeeds: RawTiebaPagePcFeedEntry[]): RawTiebaPostCard[];
export declare function buildTiebaPostItems(rawCards: RawTiebaPostCard[], requestedLimit: unknown): TiebaPostItem[];
export declare function buildTiebaSearchItems(rawItems: RawTiebaSearchItem[], requestedLimit: unknown): TiebaSearchItem[];
export declare function buildTiebaReadItems(payload: RawTiebaReadPayload, options?: TiebaReadBuildOptions): TiebaReadItem[];
