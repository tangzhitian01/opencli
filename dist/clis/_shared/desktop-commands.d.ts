/**
 * Shared command factories for Electron/desktop app adapters.
 * Eliminates duplicate screenshot/status/new/dump implementations
 * across cursor, codex, chatwise, etc.
 */
import type { CliOptions } from '../../registry.js';
/**
 * Factory: capture DOM HTML + accessibility snapshot.
 */
export declare function makeScreenshotCommand(site: string, displayName?: string, extra?: Partial<CliOptions>): import("../../registry.js").CliCommand;
/**
 * Factory: check CDP connection status.
 */
export declare function makeStatusCommand(site: string, displayName?: string, extra?: Partial<CliOptions>): import("../../registry.js").CliCommand;
/**
 * Factory: start a new session via Cmd/Ctrl+N.
 */
export declare function makeNewCommand(site: string, displayName?: string, extra?: Partial<CliOptions>): import("../../registry.js").CliCommand;
/**
 * Factory: dump DOM + snapshot for reverse-engineering.
 */
export declare function makeDumpCommand(site: string): import("../../registry.js").CliCommand;
