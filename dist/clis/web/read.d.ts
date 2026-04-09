/**
 * Generic web page reader — fetch any URL and export as Markdown.
 *
 * Uses browser-side DOM heuristics to extract the main content:
 *   1. <article> element
 *   2. [role="main"] element
 *   3. <main> element
 *   4. Largest text-dense block as fallback
 *
 * Pipes through the shared article-download pipeline (Turndown + image download).
 *
 * Usage:
 *   opencli web read --url "https://www.anthropic.com/research/..." --output ./articles
 *   opencli web read --url "https://..." --download-images false
 */
export {};
