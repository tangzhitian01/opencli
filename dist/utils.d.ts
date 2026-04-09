/**
 * Shared utility functions used across the codebase.
 */
/** Type guard: checks if a value is a non-null, non-array object. */
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/** Simple async concurrency limiter. */
export declare function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]>;
/** Pause for the given number of milliseconds. */
export declare function sleep(ms: number): Promise<void>;
/** Save a base64-encoded string to a file, creating parent directories as needed. */
export declare function saveBase64ToFile(base64: string, filePath: string): Promise<void>;
