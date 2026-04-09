import type { IPage } from '../../types.js';
export type NotebooklmPageAuth = {
    csrfToken: string;
    sessionId: string;
    sourcePath: string;
};
export type NotebooklmFetchResponse = {
    ok: boolean;
    status: number;
    body: string;
    finalUrl: string;
};
export type NotebooklmRpcCallResult = {
    auth: NotebooklmPageAuth;
    url: string;
    requestBody: string;
    response: NotebooklmFetchResponse;
    result: unknown;
};
export declare function extractNotebooklmPageAuthFromHtml(html: string, sourcePath?: string, preferredTokens?: {
    csrfToken?: string;
    sessionId?: string;
}): NotebooklmPageAuth;
export declare function getNotebooklmPageAuth(page: IPage): Promise<NotebooklmPageAuth>;
export declare function buildNotebooklmRpcBody(rpcId: string, params: unknown[] | Record<string, unknown> | null, csrfToken: string): string;
export declare function stripNotebooklmAntiXssi(rawBody: string): string;
export declare function parseNotebooklmChunkedResponse(rawBody: string): unknown[];
export declare function extractNotebooklmRpcResult(rawBody: string, rpcId: string): unknown;
export declare function fetchNotebooklmInPage(page: IPage, url: string, options?: {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
}): Promise<NotebooklmFetchResponse>;
export declare function callNotebooklmRpc(page: IPage, rpcId: string, params: unknown[] | Record<string, unknown> | null, options?: {
    hl?: string;
}): Promise<NotebooklmRpcCallResult>;
