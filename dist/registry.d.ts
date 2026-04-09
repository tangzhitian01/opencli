/**
 * Core registry: Strategy enum, Arg/CliCommand interfaces, cli() registration.
 */
import type { IPage } from './types.js';
export declare enum Strategy {
    PUBLIC = "public",
    COOKIE = "cookie",
    HEADER = "header",
    INTERCEPT = "intercept",
    UI = "ui"
}
export interface Arg {
    name: string;
    type?: string;
    default?: unknown;
    required?: boolean;
    positional?: boolean;
    help?: string;
    choices?: string[];
}
export interface RequiredEnv {
    name: string;
    help?: string;
}
export type CommandArgs = Record<string, any>;
export interface CliCommand {
    site: string;
    name: string;
    aliases?: string[];
    description: string;
    domain?: string;
    strategy?: Strategy;
    browser?: boolean;
    args: Arg[];
    columns?: string[];
    func?: (page: IPage, kwargs: CommandArgs, debug?: boolean) => Promise<unknown>;
    pipeline?: Record<string, unknown>[];
    timeoutSeconds?: number;
    /** Origin of this command: 'yaml', 'ts', or plugin name. */
    source?: string;
    footerExtra?: (kwargs: CommandArgs) => string | undefined;
    requiredEnv?: RequiredEnv[];
    /** Deprecation note shown in help / execution warnings. */
    deprecated?: boolean | string;
    /** Preferred replacement command, if any. */
    replacedBy?: string;
    /**
     * Control pre-navigation for cookie/header context before command execution.
     *
     * Browser adapters using COOKIE/HEADER strategy need the page to be on the
     * target domain so that `fetch(url, { credentials: 'include' })` carries cookies.
     *
     * - `undefined` / `true`: navigate to `https://${domain}` (default)
     * - `false`: skip — adapter handles its own navigation (e.g. boss common.ts)
     * - `string`: navigate to this specific URL instead of the domain root
     */
    navigateBefore?: boolean | string;
}
/** Internal extension for lazy-loaded TS modules (not exposed in public API) */
export interface InternalCliCommand extends CliCommand {
    _lazy?: boolean;
    _modulePath?: string;
}
export interface CliOptions extends Partial<Omit<CliCommand, 'args' | 'description'>> {
    site: string;
    name: string;
    description?: string;
    args?: Arg[];
}
declare global {
    var __opencli_registry__: Map<string, CliCommand> | undefined;
}
export declare function cli(opts: CliOptions): CliCommand;
export declare function getRegistry(): Map<string, CliCommand>;
export declare function fullName(cmd: CliCommand): string;
export declare function strategyLabel(cmd: CliCommand): string;
export declare function registerCommand(cmd: CliCommand): void;
