type TimelineType = 'for-you' | 'following';
interface TimelineTweet {
    id: string;
    author: string;
    text: string;
    likes: number;
    retweets: number;
    replies: number;
    views: number;
    created_at: string;
    url: string;
}
declare function buildTimelineVariables(type: TimelineType, count: number, cursor?: string | null): Record<string, unknown>;
declare function buildHomeTimelineUrl(queryId: string, endpoint: string, vars: Record<string, unknown>): string;
declare function parseHomeTimeline(data: any, seen: Set<string>): {
    tweets: TimelineTweet[];
    nextCursor: string | null;
};
export declare const __test__: {
    buildTimelineVariables: typeof buildTimelineVariables;
    buildHomeTimelineUrl: typeof buildHomeTimelineUrl;
    parseHomeTimeline: typeof parseHomeTimeline;
};
export {};
