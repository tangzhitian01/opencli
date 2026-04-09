export interface HashtagInfo {
    name: string;
    id: number;
    start: number;
    end: number;
}
export interface TextExtraItem {
    type: number;
    hashtag_id: number;
    hashtag_name: string;
    start: number;
    end: number;
    caption_start: number;
    caption_end: number;
}
export declare function parseTextExtra(_text: string, hashtags: HashtagInfo[]): TextExtraItem[];
/** Extract hashtag names from text (e.g. "#话题" → ["话题"]) */
export declare function extractHashtagNames(text: string): string[];
