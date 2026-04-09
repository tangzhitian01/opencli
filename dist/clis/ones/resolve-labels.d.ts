/**
 * 把 status / project 的 uuid 解析为中文名（团队级接口各查一次或按批）
 */
import type { IPage } from '../../types.js';
export declare function loadTaskStatusLabels(page: IPage, team: string, skipGoto: boolean): Promise<Map<string, string>>;
export declare function loadProjectLabels(page: IPage, team: string, projectUuids: string[], skipGoto: boolean): Promise<Map<string, string>>;
export declare function resolveTaskListLabels(page: IPage, team: string, entries: Record<string, unknown>[], skipGoto: boolean): Promise<{
    statusByUuid: Map<string, string>;
    projectByUuid: Map<string, string>;
}>;
