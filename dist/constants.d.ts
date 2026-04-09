/**
 * Shared constants used across explore, synthesize, and pipeline modules.
 */
/** Default daemon port for HTTP/WebSocket communication with browser extension */
export declare const DEFAULT_DAEMON_PORT = 19825;
/** Default idle timeout before daemon auto-exits (ms). Override via OPENCLI_DAEMON_TIMEOUT env var. */
export declare const DEFAULT_DAEMON_IDLE_TIMEOUT: number;
/** URL query params that are volatile/ephemeral and should be stripped from patterns */
export declare const VOLATILE_PARAMS: Set<string>;
/** Search-related query parameter names */
export declare const SEARCH_PARAMS: Set<string>;
/** Pagination-related query parameter names */
export declare const PAGINATION_PARAMS: Set<string>;
/** Limit/page-size query parameter names */
export declare const LIMIT_PARAMS: Set<string>;
/** Field role → common API field names mapping */
export declare const FIELD_ROLES: Record<string, string[]>;
