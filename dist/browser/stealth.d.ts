/**
 * Stealth anti-detection module.
 *
 * Generates JS code that patches browser globals to hide automation
 * fingerprints (e.g. navigator.webdriver, missing chrome object, empty
 * plugin list). Injected before page scripts run so that websites cannot
 * detect CDP / extension-based control.
 *
 * Inspired by puppeteer-extra-plugin-stealth.
 */
/**
 * Return a self-contained JS string that, when evaluated in a page context,
 * applies all stealth patches. Safe to call multiple times — the guard flag
 * ensures patches are applied only once.
 */
export declare function generateStealthJs(): string;
