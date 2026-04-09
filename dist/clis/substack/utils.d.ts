import type { IPage } from '../../types.js';
export declare function buildSubstackBrowseUrl(category?: string): string;
export declare function loadSubstackFeed(page: IPage, url: string, limit: number): Promise<any[]>;
export declare function loadSubstackArchive(page: IPage, baseUrl: string, limit: number): Promise<any[]>;
export declare const __test__: {
    FEED_POST_LINK_SELECTOR: string;
    ARCHIVE_POST_LINK_SELECTOR: string;
};
