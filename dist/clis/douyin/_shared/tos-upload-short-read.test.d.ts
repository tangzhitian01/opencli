/**
 * Tests for the fs.readSync short-read guard in tosUpload.
 *
 * This file is separate from tos-upload.test.ts because vi.mock is hoisted and
 * would interfere with the real-fs tests there.
 *
 * Strategy:
 * - Use setReadSyncOverride (exported testing seam) to force readSync to return 0
 * - Mock global fetch to satisfy initMultipartUpload so the code path reaches readSync
 */
export {};
