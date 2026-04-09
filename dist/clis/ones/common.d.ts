/**
 * ONES 旧版 Project API — 经 Browser Bridge 在已登录标签页内 fetch（携带 Cookie）。
 * 文档：https://developer.ones.cn/zh-CN/docs/api/readme/
 */
import type { IPage } from '../../types.js';
export declare const API_PREFIX = "/project/api/project";
export declare function getOnesBaseUrl(): string;
export declare function onesApiUrl(apiPath: string): string;
/** 打开 ONES 根地址，确保后续 fetch 与页面同源、带上登录 Cookie */
export declare function gotoOnesHome(page: IPage): Promise<void>;
export declare function summarizeOnesError(status: number, body: unknown): string;
export declare function onesFetchInPageWithMeta(page: IPage, apiPath: string, options?: {
    method?: string;
    body?: string | null;
    auth?: boolean;
    skipGoto?: boolean;
}): Promise<{
    ok: boolean;
    status: number;
    parsed: unknown;
}>;
/** 当前操作用户 8 位 uuid（Header 或 GET users/me） */
export declare function resolveOnesUserUuid(page: IPage, opts?: {
    skipGoto?: boolean;
}): Promise<string>;
export declare function onesFetchInPage(page: IPage, apiPath: string, options?: {
    method?: string;
    body?: string | null;
    auth?: boolean;
    /** 已在 ONES 根页时设为 true，避免每条 API 都 goto+wait（显著提速） */
    skipGoto?: boolean;
}): Promise<unknown>;
