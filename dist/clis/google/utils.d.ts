/**
 * Google adapter utilities.
 * Shared RSS parser for news and trends commands.
 */
/**
 * Parse RSS XML by splitting into <item> blocks, then extracting fields per block.
 * Handles both plain text and CDATA-wrapped content.
 */
export declare function parseRssItems(xml: string, fields: string[]): Record<string, string>[];
