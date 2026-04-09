/**
 * peek 列表只有轻量字段，用 batch tasks/info 补全 summary 等（ONES 文档 #7）
 */
import type { IPage } from '../../types.js';
export declare function enrichPeekEntriesWithDetails(page: IPage, team: string, entries: Record<string, unknown>[], skipGoto: boolean): Promise<Record<string, unknown>[]>;
