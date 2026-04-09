import type { IPage } from '../../types.js';
export declare function buildMediumTagUrl(topic?: string): string;
export declare function buildMediumSearchUrl(keyword: string): string;
export declare function buildMediumUserUrl(username: string): string;
export declare function loadMediumPosts(page: IPage, url: string, limit: number): Promise<any[]>;
