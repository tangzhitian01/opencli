/**
 * Page abstraction — implements IPage by sending commands to the daemon.
 *
 * All browser operations are ultimately 'exec' (JS evaluation via CDP)
 * plus a few native Chrome Extension APIs (tabs, cookies, navigate).
 *
 * IMPORTANT: After goto(), we remember the tabId returned by the navigate
 * action and pass it to all subsequent commands. This avoids the issue
 * where resolveTabId() in the extension picks a chrome:// or
 * chrome-extension:// tab that can't be debugged.
 */
import type { BrowserCookie, ScreenshotOptions } from '../types.js';
import { BasePage } from './base-page.js';
export declare function isRetryableSettleError(err: unknown): boolean;
/**
 * Page — implements IPage by talking to the daemon via HTTP.
 */
export declare class Page extends BasePage {
    private readonly workspace;
    constructor(workspace?: string);
    /** Active tab ID, set after navigate and used in all subsequent commands */
    private _tabId;
    /** Helper: spread workspace into command params */
    private _wsOpt;
    /** Helper: spread workspace + tabId into command params */
    private _cmdOpts;
    goto(url: string, options?: {
        waitUntil?: 'load' | 'none';
        settleMs?: number;
    }): Promise<void>;
    getActiveTabId(): number | undefined;
    evaluate(js: string): Promise<unknown>;
    getCookies(opts?: {
        domain?: string;
        url?: string;
    }): Promise<BrowserCookie[]>;
    /** Close the automation window in the extension */
    closeWindow(): Promise<void>;
    tabs(): Promise<unknown[]>;
    closeTab(index?: number): Promise<void>;
    newTab(): Promise<void>;
    selectTab(index: number): Promise<void>;
    /**
     * Capture a screenshot via CDP Page.captureScreenshot.
     */
    screenshot(options?: ScreenshotOptions): Promise<string>;
    /**
     * Set local file paths on a file input element via CDP DOM.setFileInputFiles.
     * Chrome reads the files directly from the local filesystem, avoiding the
     * payload size limits of base64-in-evaluate.
     */
    setFileInput(files: string[], selector?: string): Promise<void>;
}
