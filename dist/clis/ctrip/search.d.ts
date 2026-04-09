declare function clampLimit(raw: unknown, fallback?: number): number;
declare function mapSearchResults(results: unknown[], limit: number): {
    rank: number;
    name: string;
    type: string;
    score: string | number;
    price: string | number;
    url: string;
}[];
export declare const __test__: {
    clampLimit: typeof clampLimit;
    mapSearchResults: typeof mapSearchResults;
};
export {};
