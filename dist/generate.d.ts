/**
 * Generate: one-shot CLI creation from URL.
 *
 * Orchestrates the full pipeline:
 *   explore (Deep Explore) → synthesize (YAML generation) → register → verify
 *
 * Includes Strategy Cascade: if the initial strategy fails,
 * automatically downgrades and retries.
 */
import type { IBrowserFactory } from './runtime.js';
import { type SynthesizeCandidateSummary } from './synthesize.js';
export interface GenerateCliOptions {
    url: string;
    BrowserFactory: new () => IBrowserFactory;
    goal?: string | null;
    site?: string;
    waitSeconds?: number;
    top?: number;
    workspace?: string;
}
export interface GenerateCliResult {
    ok: boolean;
    goal?: string | null;
    normalized_goal?: string | null;
    site: string;
    selected_candidate: SynthesizeCandidateSummary | null;
    selected_command: string;
    explore: {
        endpoint_count: number;
        api_endpoint_count: number;
        capability_count: number;
        top_strategy: string;
        framework: Record<string, boolean>;
    };
    synthesize: {
        candidate_count: number;
        candidates: Array<Pick<SynthesizeCandidateSummary, 'name' | 'strategy' | 'confidence'>>;
    };
}
export declare function generateCliFromUrl(opts: GenerateCliOptions): Promise<GenerateCliResult>;
export declare function renderGenerateSummary(r: GenerateCliResult): string;
