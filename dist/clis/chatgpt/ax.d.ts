type ModelChoice = 'auto' | 'instant' | 'thinking' | '5.2-instant' | '5.2-thinking';
export declare const MODEL_CHOICES: ModelChoice[];
export declare function activateChatGPT(delaySeconds?: number): void;
export declare function selectModel(model: string): string;
export declare function isGenerating(): boolean;
export declare function getVisibleChatMessages(): string[];
export {};
