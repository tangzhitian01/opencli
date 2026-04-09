/**
 * Douyin publish — 8-phase pipeline for scheduling video posts.
 *
 * Phases:
 *   1. STS2 credentials
 *   2. Apply TOS upload URL
 *   3. TOS multipart upload
 *   4. Cover upload (optional, via ImageX)
 *   5. Enable video
 *   6. Poll transcode
 *   7. Content safety check
 *   8. create_v2 publish
 */
export {};
