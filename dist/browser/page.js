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
import { sendCommand } from './daemon-client.js';
import { wrapForEval } from './utils.js';
import { saveBase64ToFile } from '../utils.js';
import { generateStealthJs } from './stealth.js';
import { waitForDomStableJs } from './dom-helpers.js';
import { BasePage } from './base-page.js';
export function isRetryableSettleError(err) {
    const message = err instanceof Error ? err.message : String(err);
    return message.includes('Inspected target navigated or closed')
        || (message.includes('-32000') && message.toLowerCase().includes('target'));
}
/**
 * Page — implements IPage by talking to the daemon via HTTP.
 */
export class Page extends BasePage {
    workspace;
    constructor(workspace = 'default') {
        super();
        this.workspace = workspace;
    }
    /** Active tab ID, set after navigate and used in all subsequent commands */
    _tabId;
    /** Helper: spread workspace into command params */
    _wsOpt() {
        return { workspace: this.workspace };
    }
    /** Helper: spread workspace + tabId into command params */
    _cmdOpts() {
        return {
            workspace: this.workspace,
            ...(this._tabId !== undefined && { tabId: this._tabId }),
        };
    }
    async goto(url, options) {
        const result = await sendCommand('navigate', {
            url,
            ...this._cmdOpts(),
        });
        // Remember the tabId and URL for subsequent calls
        if (result?.tabId) {
            this._tabId = result.tabId;
        }
        this._lastUrl = url;
        // Inject stealth anti-detection patches (guard flag prevents double-injection).
        try {
            await sendCommand('exec', {
                code: generateStealthJs(),
                ...this._cmdOpts(),
            });
        }
        catch {
            // Non-fatal: stealth is best-effort
        }
        // Smart settle: use DOM stability detection instead of fixed sleep.
        // settleMs is now a timeout cap (default 1000ms), not a fixed wait.
        if (options?.waitUntil !== 'none') {
            const maxMs = options?.settleMs ?? 1000;
            const settleOpts = {
                code: waitForDomStableJs(maxMs, Math.min(500, maxMs)),
                ...this._cmdOpts(),
            };
            try {
                await sendCommand('exec', settleOpts);
            }
            catch (err) {
                if (!isRetryableSettleError(err))
                    throw err;
                // SPA client-side redirects can invalidate the CDP target after
                // chrome.tabs reports 'complete'. Wait briefly for the new document
                // to load, then retry the settle probe once.
                try {
                    await new Promise((r) => setTimeout(r, 200));
                    await sendCommand('exec', settleOpts);
                }
                catch (retryErr) {
                    if (!isRetryableSettleError(retryErr))
                        throw retryErr;
                    // Retry also failed — give up silently. Settle is best-effort
                    // after successful navigation; the next real command will surface
                    // any persistent target error immediately.
                }
            }
        }
    }
    getActiveTabId() {
        return this._tabId;
    }
    async evaluate(js) {
        const code = wrapForEval(js);
        try {
            return await sendCommand('exec', { code, ...this._cmdOpts() });
        }
        catch (err) {
            if (!isRetryableSettleError(err))
                throw err;
            await new Promise((resolve) => setTimeout(resolve, 200));
            return sendCommand('exec', { code, ...this._cmdOpts() });
        }
    }
    async getCookies(opts = {}) {
        const result = await sendCommand('cookies', { ...this._wsOpt(), ...opts });
        return Array.isArray(result) ? result : [];
    }
    /** Close the automation window in the extension */
    async closeWindow() {
        try {
            await sendCommand('close-window', { ...this._wsOpt() });
        }
        catch {
            // Window may already be closed or daemon may be down
        }
    }
    async tabs() {
        const result = await sendCommand('tabs', { op: 'list', ...this._wsOpt() });
        return Array.isArray(result) ? result : [];
    }
    async closeTab(index) {
        await sendCommand('tabs', { op: 'close', ...this._wsOpt(), ...(index !== undefined ? { index } : {}) });
        // Invalidate cached tabId — the closed tab might have been our active one.
        // We can't know for sure (close-by-index doesn't return tabId), so reset.
        this._tabId = undefined;
    }
    async newTab() {
        const result = await sendCommand('tabs', { op: 'new', ...this._wsOpt() });
        if (result?.tabId)
            this._tabId = result.tabId;
    }
    async selectTab(index) {
        const result = await sendCommand('tabs', { op: 'select', index, ...this._wsOpt() });
        if (result?.selected)
            this._tabId = result.selected;
    }
    /**
     * Capture a screenshot via CDP Page.captureScreenshot.
     */
    async screenshot(options = {}) {
        const base64 = await sendCommand('screenshot', {
            ...this._cmdOpts(),
            format: options.format,
            quality: options.quality,
            fullPage: options.fullPage,
        });
        if (options.path) {
            await saveBase64ToFile(base64, options.path);
        }
        return base64;
    }
    /**
     * Set local file paths on a file input element via CDP DOM.setFileInputFiles.
     * Chrome reads the files directly from the local filesystem, avoiding the
     * payload size limits of base64-in-evaluate.
     */
    async setFileInput(files, selector) {
        const result = await sendCommand('set-file-input', {
            files,
            selector,
            ...this._cmdOpts(),
        });
        if (!result?.count) {
            throw new Error('setFileInput returned no count — command may not be supported by the extension');
        }
    }
}
// (End of file)
