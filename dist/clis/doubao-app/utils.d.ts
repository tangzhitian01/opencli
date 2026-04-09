/**
 * Shared constants and helpers for Doubao desktop app (Electron + CDP).
 *
 * Requires: Doubao launched with --remote-debugging-port=9226
 */
/** Selectors discovered via data-testid attributes */
export declare const SEL: {
    readonly INPUT: "[data-testid=\"chat_input_input\"]";
    readonly SEND_BTN: "[data-testid=\"chat_input_send_button\"]";
    readonly MESSAGE: "[data-testid=\"message_content\"]";
    readonly MESSAGE_TEXT: "[data-testid=\"message_text_content\"]";
    readonly INDICATOR: "[data-testid=\"indicator\"]";
    readonly NEW_CHAT: "[data-testid=\"new_chat_button\"]";
    readonly NEW_CHAT_SIDEBAR: "[data-testid=\"app-open-newChat\"]";
};
/**
 * Inject text into the Doubao chat textarea via React-compatible value setter.
 * Returns an evaluate script string.
 */
export declare function injectTextScript(text: string): string;
/**
 * Click the send button. Returns an evaluate script string.
 */
export declare function clickSendScript(): string;
/**
 * Read all chat messages from the DOM. Returns an evaluate script string.
 */
export declare function readMessagesScript(): string;
/**
 * Click the new-chat button. Returns an evaluate script string.
 */
export declare function clickNewChatScript(): string;
/**
 * Poll for a new assistant response after sending.
 * Returns evaluate script that checks message count vs baseline.
 */
export declare function pollResponseScript(beforeCount: number): string;
