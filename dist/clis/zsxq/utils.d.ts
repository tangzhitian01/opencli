import type { IPage } from '../../types.js';
export interface ZsxqUser {
    user_id?: number;
    name?: string;
    avatar_url?: string;
}
export interface ZsxqGroup {
    group_id?: number;
    name?: string;
    description?: string;
    background_url?: string;
    owner?: ZsxqUser;
    statistics?: {
        topics_count?: number;
        answers_count?: number;
        comments_count?: number;
        likes_count?: number;
        subscriptions_count?: number;
    };
    category?: {
        title?: string;
    };
    user_specific?: {
        join_time?: string;
        validity?: {
            end_time?: string;
        };
    };
}
export interface ZsxqComment {
    comment_id?: number;
    create_time?: string;
    text?: string;
    owner?: ZsxqUser;
    likes_count?: number;
    rewards_count?: number;
    repliee?: ZsxqUser;
}
export interface ZsxqTopic {
    topic_id?: number;
    create_time?: string;
    comments_count?: number;
    likes_count?: number;
    readers_count?: number;
    reading_count?: number;
    rewards_count?: number;
    title?: string;
    type?: string;
    group?: ZsxqGroup;
    owner?: ZsxqUser;
    user_specific?: Record<string, unknown>;
    talk?: {
        owner?: ZsxqUser;
        text?: string;
    };
    question?: {
        owner?: ZsxqUser;
        text?: string;
    };
    answer?: {
        owner?: ZsxqUser;
        text?: string;
    };
    task?: {
        owner?: ZsxqUser;
        text?: string;
    };
    solution?: {
        owner?: ZsxqUser;
        text?: string;
    };
    show_comments?: ZsxqComment[];
    comments?: ZsxqComment[];
}
export interface BrowserFetchResult {
    ok: boolean;
    url?: string;
    status?: number;
    error?: string;
    data?: unknown;
}
export declare function ensureZsxqPage(page: IPage): Promise<void>;
export declare function ensureZsxqAuth(page: IPage): Promise<void>;
export declare function getCookieValue(page: IPage, name: string): Promise<string | undefined>;
export declare function getActiveGroupId(page: IPage): Promise<string>;
export declare function browserJsonRequest(page: IPage, path: string): Promise<BrowserFetchResult>;
export declare function fetchFirstJson(page: IPage, paths: string[]): Promise<BrowserFetchResult>;
export declare function unwrapRespData<T>(payload: unknown): T;
export declare function getTopicsFromResponse(payload: unknown): ZsxqTopic[];
export declare function getCommentsFromResponse(payload: unknown): ZsxqComment[];
export declare function getGroupsFromResponse(payload: unknown): ZsxqGroup[];
export declare function getTopicFromResponse(payload: unknown): ZsxqTopic | null;
export declare function getTopicAuthor(topic: ZsxqTopic): string;
export declare function getTopicText(topic: ZsxqTopic): string;
export declare function getTopicUrl(topicId: number | string | undefined): string;
export declare function summarizeComments(comments: ZsxqComment[], limit?: number): string;
export declare function toTopicRow(topic: ZsxqTopic): Record<string, unknown>;
