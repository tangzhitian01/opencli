import { sanitizeQueryId } from './shared.js';
interface LikedTweet {
    id: string;
    author: string;
    name: string;
    text: string;
    likes: number;
    retweets: number;
    created_at: string;
    url: string;
}
declare function buildLikesUrl(queryId: string, userId: string, count: number, cursor?: string | null): string;
declare function buildUserByScreenNameUrl(queryId: string, screenName: string): string;
declare function parseLikes(data: any, seen: Set<string>): {
    tweets: LikedTweet[];
    nextCursor: string | null;
};
export declare const __test__: {
    sanitizeQueryId: typeof sanitizeQueryId;
    buildLikesUrl: typeof buildLikesUrl;
    buildUserByScreenNameUrl: typeof buildUserByScreenNameUrl;
    parseLikes: typeof parseLikes;
};
export {};
