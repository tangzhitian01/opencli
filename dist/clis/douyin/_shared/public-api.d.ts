import type { IPage } from '../../../types.js';
export interface DouyinComment {
    text?: string;
    digg_count?: number;
    user?: {
        nickname?: string;
    };
}
export interface DouyinVideo {
    aweme_id: string;
    desc?: string;
    video?: {
        duration?: number;
        play_addr?: {
            url_list?: string[];
        };
    };
    statistics?: {
        digg_count?: number;
    };
}
export interface DouyinVideoListResponse {
    aweme_list?: DouyinVideo[];
}
export interface DouyinCommentListResponse {
    comments?: DouyinComment[];
}
export declare function fetchDouyinUserVideos(page: IPage, secUid: string, count: number): Promise<DouyinVideo[]>;
export declare function fetchDouyinComments(page: IPage, awemeId: string, count: number): Promise<Array<{
    text: string;
    digg_count: number;
    nickname: string;
}>>;
