import type { IPage } from '../../types.js';
declare function normalizeBubbleText(value: unknown): string;
declare function normalizeBooleanFlag(value: unknown): boolean;
declare function pickLatestAssistantCandidate(bubbles: unknown[], baselineCount: number, prompt: string): string;
declare function updateStableState(previousText: string, stableCount: number, nextText: string): {
    previousText: string;
    stableCount: number;
};
/** Check whether the tab is already on grok.com (any path). */
declare function isOnGrok(page: IPage): Promise<boolean>;
export declare const askCommand: import("../../registry.js").CliCommand;
export declare const __test__: {
    pickLatestAssistantCandidate: typeof pickLatestAssistantCandidate;
    updateStableState: typeof updateStableState;
    normalizeBooleanFlag: typeof normalizeBooleanFlag;
    normalizeBubbleText: typeof normalizeBubbleText;
    isOnGrok: typeof isOnGrok;
};
export {};
