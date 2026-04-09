export interface InstagramMediaTarget {
    kind: 'p' | 'reel' | 'tv';
    shortcode: string;
    canonicalUrl: string;
}
interface InstagramPageMediaItem {
    type: 'image' | 'video';
    url: string;
}
interface DownloadedMediaItem extends InstagramPageMediaItem {
    filename: string;
}
export declare function parseInstagramMediaTarget(input: string): InstagramMediaTarget;
export declare function buildInstagramDownloadItems(shortcode: string, items: InstagramPageMediaItem[]): DownloadedMediaItem[];
export declare function buildInstagramFetchScript(shortcode: string): string;
export {};
