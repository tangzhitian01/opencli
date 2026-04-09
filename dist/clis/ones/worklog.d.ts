/**
 * Log/backfill work hours. Project API paths vary by deployment,
 * so we try common endpoints in sequence.
 */
export declare function buildAddManhourGraphqlBody(input: {
    ownerId: string;
    taskId: string;
    startTime: number;
    rawManhour: number;
    note: string;
}): string;
