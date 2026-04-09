/**
 * Product Hunt shared helpers.
 */
export interface PhPost {
    rank: number;
    name: string;
    tagline: string;
    author: string;
    date: string;
    url: string;
}
export interface ProductHuntVoteCandidate {
    text: string;
    tagName?: string;
    className?: string;
    role?: string;
    inButton?: boolean;
    inReviewLink?: boolean;
}
export declare const PRODUCTHUNT_CATEGORY_SLUGS: readonly ["ai-agents", "ai-coding-agents", "ai-code-editors", "ai-chatbots", "ai-workflow-automation", "vibe-coding", "developer-tools", "productivity", "design-creative", "marketing-sales", "no-code-platforms", "llms", "finance", "social-community", "engineering-development"];
/**
 * Fetch Product Hunt Atom RSS feed.
 * @param category  Optional category slug (e.g. "ai", "developer-tools")
 */
export declare function fetchFeed(category?: string): Promise<PhPost[]>;
export declare function parseFeed(xml: string): PhPost[];
export declare function pickVoteCount(candidates: ProductHuntVoteCandidate[]): string;
/** Format ISO date string to YYYY-MM-DD */
export declare function toDate(iso: string): string;
