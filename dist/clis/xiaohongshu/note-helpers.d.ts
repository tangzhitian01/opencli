/** Side-effect-free helpers shared by xiaohongshu note and comments commands. */
/** Extract a bare note ID from a full URL or raw ID string. */
export declare function parseNoteId(input: string): string;
/**
 * Build the best navigation URL for a note.
 *
 * XHS blocks direct `/explore/<id>` access without a valid `xsec_token`.
 * When the user passes a full URL (from search results), we preserve it
 * so the browser navigates with the token intact. For bare IDs we fall
 * back to the `/explore/<id>` path (works when cookies carry enough context).
 */
export declare function buildNoteUrl(input: string): string;
