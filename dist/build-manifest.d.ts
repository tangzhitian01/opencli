#!/usr/bin/env node
/**
 * Build-time CLI manifest compiler.
 *
 * Scans all YAML/TS CLI definitions and pre-compiles them into a single
 * manifest.json for instant cold-start registration (no runtime YAML parsing).
 *
 * Usage: npx tsx src/build-manifest.ts
 * Output: dist/cli-manifest.json
 */
export interface ManifestEntry {
    site: string;
    name: string;
    aliases?: string[];
    description: string;
    domain?: string;
    strategy: string;
    browser: boolean;
    args: Array<{
        name: string;
        type?: string;
        default?: unknown;
        required?: boolean;
        positional?: boolean;
        help?: string;
        choices?: string[];
    }>;
    columns?: string[];
    pipeline?: Record<string, unknown>[];
    timeout?: number;
    deprecated?: boolean | string;
    replacedBy?: string;
    /** 'yaml' or 'ts' — determines how executeCommand loads the handler */
    type: 'yaml' | 'ts';
    /** Relative path from clis/ dir, e.g. 'bilibili/hot.yaml' or 'bilibili/search.js' */
    modulePath?: string;
    /** Pre-navigation control — see CliCommand.navigateBefore */
    navigateBefore?: boolean | string;
}
export declare function loadTsManifestEntries(filePath: string, site: string, importer?: (moduleHref: string) => Promise<unknown>): Promise<ManifestEntry[]>;
/**
 * When both YAML and TS adapters exist for the same site/name,
 * prefer the TS version (it self-registers and typically has richer logic).
 */
export declare function shouldReplaceManifestEntry(current: ManifestEntry, next: ManifestEntry): boolean;
export declare function buildManifest(): Promise<ManifestEntry[]>;
