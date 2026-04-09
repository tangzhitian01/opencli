/**
 * ONES filters/peek 响应解析（tasks / my-tasks 共用）
 */
export declare function pickTaskTitle(e: Record<string, unknown>): string;
/** 表格里标题别撑爆终端 */
export declare function ellipsizeCell(s: string, max?: number): string;
/** 辅助列：长 uuid 缩略，完整值见 -f json */
export declare function briefUuid(id: string, head?: number, tail?: number): string;
export declare function formatStamp(v: unknown): string;
export declare function flattenPeekGroups(parsed: Record<string, unknown>, limit: number): Record<string, unknown>[];
/** 工作项状态 uuid（用于查 task_statuses 得中文名） */
export declare function getTaskStatusRawId(e: Record<string, unknown>): string;
/** 项目 uuid */
export declare function getTaskProjectRawId(e: Record<string, unknown>): string;
/**
 * Project API 里 assess/total/remaining_manhour 多为**定点整数**（与 Web 上「小时」不一致）；
 * 常见换算：raw / 1e5 ≈ 小时。若你方实例不同，可设 `ONES_MANHOUR_SCALE`（默认 100000）。
 */
export declare function onesManhourScale(): number;
/** 界面/h 小数 → API 内 manhour 整数（与列表「工时」列同一刻度） */
export declare function hoursToOnesManhourRaw(hours: number): number;
export declare function formatTaskManhourSummary(e: Record<string, unknown>): string;
export interface TaskLabelMaps {
    statusByUuid?: Map<string, string>;
    projectByUuid?: Map<string, string>;
}
export declare function mapTaskEntry(e: Record<string, unknown>, labels?: TaskLabelMaps): Record<string, string>;
export declare function defaultPeekBody(query: Record<string, unknown>): Record<string, unknown>;
export declare function parsePeekLimit(value: unknown, fallback: number): number;
