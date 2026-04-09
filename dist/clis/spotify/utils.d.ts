export interface SpotifyCredentials {
    clientId: string;
    clientSecret: string;
}
export interface SpotifyTrackSummary {
    track: string;
    artist: string;
    album: string;
    uri: string;
}
export declare function parseDotEnv(content: string): Record<string, string>;
export declare function resolveSpotifyCredentials(fileEnv: Record<string, string>, processEnv?: NodeJS.ProcessEnv): SpotifyCredentials;
export declare function isPlaceholderCredential(value: string | null | undefined): boolean;
export declare function hasConfiguredSpotifyCredentials(credentials: SpotifyCredentials): boolean;
export declare function assertSpotifyCredentialsConfigured(credentials: SpotifyCredentials, envFile: string): void;
export declare function mapSpotifyTrackResults(data: any): SpotifyTrackSummary[];
export declare function getFirstSpotifyTrack(data: any): {
    uri: string;
    name: string;
    artist: string;
} | null;
