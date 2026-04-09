import type { IPage } from '../../types.js';
export declare function sanitizeQueryId(resolved: unknown, fallbackId: string): string;
export declare function resolveTwitterQueryId(page: Pick<IPage, 'evaluate'>, operationName: string, fallbackId: string): Promise<string>;
export declare const __test__: {
    sanitizeQueryId: typeof sanitizeQueryId;
};
