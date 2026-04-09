import type { IPage } from '../../types.js';
export declare function buildSinaBlogSearchUrl(keyword: string): string;
export declare function buildSinaBlogUserUrl(uid: string): string;
export declare function loadSinaBlogArticle(page: IPage, url: string): Promise<any>;
export declare function loadSinaBlogHot(page: IPage, limit: number): Promise<any[]>;
export declare function loadSinaBlogSearch(page: IPage, keyword: string, limit: number): Promise<any[]>;
export declare function loadSinaBlogUser(page: IPage, uid: string, limit: number): Promise<any[]>;
