/**
 * Synthesize candidate CLIs from explore artifacts.
 * Generates evaluate-based YAML pipelines (matching hand-written adapter patterns).
 */
import type { ExploreAuthSummary, ExploreEndpointArtifact, ExploreManifest } from './explore.js';
interface RecommendedArg {
    name: string;
    type?: string;
    required?: boolean;
    default?: unknown;
}
interface StoreHint {
    store: string;
    action: string;
}
export interface SynthesizeCapability {
    name: string;
    description: string;
    strategy: string;
    confidence?: number;
    endpoint?: string;
    itemPath?: string | null;
    recommendedColumns?: string[];
    recommendedArgs?: RecommendedArg[];
    recommended_args?: RecommendedArg[];
    recommendedColumnsLegacy?: string[];
    recommended_columns?: string[];
    storeHint?: StoreHint;
}
export interface GeneratedArgDefinition {
    type: string;
    required?: boolean;
    default?: unknown;
    description?: string;
}
type CandidatePipelineStep = {
    navigate: string;
} | {
    wait: number;
} | {
    evaluate: string;
} | {
    select: string;
} | {
    map: Record<string, string>;
} | {
    limit: string;
} | {
    fetch: {
        url: string;
    };
} | {
    tap: {
        store: string;
        action: string;
        timeout: number;
        capture?: string;
        select?: string | null;
    };
};
export interface CandidateYaml {
    site: string;
    name: string;
    description: string;
    domain: string;
    strategy: string;
    browser: boolean;
    args: Record<string, GeneratedArgDefinition>;
    pipeline: CandidatePipelineStep[];
    columns: string[];
}
export interface SynthesizeCandidateSummary {
    name: string;
    path: string;
    strategy: string;
    confidence?: number;
}
export interface SynthesizeResult {
    site: string;
    explore_dir: string;
    out_dir: string;
    candidate_count: number;
    candidates: SynthesizeCandidateSummary[];
}
interface LoadedExploreBundle {
    manifest: ExploreManifest;
    endpoints: ExploreEndpointArtifact[];
    capabilities: SynthesizeCapability[];
    auth: ExploreAuthSummary;
}
export declare function synthesizeFromExplore(target: string, opts?: {
    outDir?: string;
    top?: number;
}): SynthesizeResult;
export declare function renderSynthesizeSummary(result: SynthesizeResult): string;
export declare function resolveExploreDir(target: string): string;
export declare function loadExploreBundle(exploreDir: string): LoadedExploreBundle;
/** Backward-compatible export for scaffold.ts */
export declare function buildCandidate(site: string, targetUrl: string, cap: SynthesizeCapability, endpoint: ExploreEndpointArtifact): {
    name: string;
    yaml: CandidateYaml;
};
export {};
