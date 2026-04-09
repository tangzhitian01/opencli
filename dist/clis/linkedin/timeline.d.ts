interface TimelinePost {
    rank?: number;
    id: string;
    author: string;
    author_url: string;
    headline: string;
    text: string;
    posted_at: string;
    reactions: number;
    comments: number;
    url: string;
}
declare function parseMetric(value: unknown): number;
declare function buildPostId(post: Partial<TimelinePost>): string;
declare function mergeTimelinePosts(existing: TimelinePost[], batch: TimelinePost[]): TimelinePost[];
export declare const __test__: {
    parseMetric: typeof parseMetric;
    buildPostId: typeof buildPostId;
    mergeTimelinePosts: typeof mergeTimelinePosts;
};
export {};
