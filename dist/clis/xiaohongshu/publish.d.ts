/**
 * Xiaohongshu 图文笔记 publisher — creator center UI automation.
 *
 * Flow:
 *   1. Navigate to creator publish page
 *   2. Upload images via CDP DOM.setFileInputFiles (with base64 fallback)
 *   3. Fill title and body text
 *   4. Add topic hashtags
 *   5. Publish (or save as draft)
 *
 * Requires: logged into creator.xiaohongshu.com in Chrome.
 *
 * Usage:
 *   opencli xiaohongshu publish --title "标题" "正文内容" \
 *     --images /path/a.jpg,/path/b.jpg \
 *     --topics 生活,旅行
 */
export {};
