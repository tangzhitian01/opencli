/**
 * Browser connection error helpers.
 *
 * Simplified — no more token/extension/CDP classification.
 * The daemon architecture has a single failure mode: daemon not reachable or extension not connected.
 */
import { BrowserConnectError, type BrowserConnectKind } from '../errors.js';
/**
 * Check if an error message indicates a transient browser error worth retrying.
 */
export declare function isTransientBrowserError(err: unknown): boolean;
export type ConnectFailureKind = BrowserConnectKind;
export declare function formatBrowserConnectError(kind: ConnectFailureKind, detail?: string): BrowserConnectError;
