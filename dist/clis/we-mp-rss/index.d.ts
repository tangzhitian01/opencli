/**
 * we-mp-rss — 微信公众号 RSS 订阅管理 CLI
 *
 * Self-hosted WeChat Official Account RSS service adapter.
 * Requires a running we-mp-rss instance (Docker: docker run -p 8001:8001 ghcr.io/rachelos/we-mp-rss)
 *
 * Environment variables:
 *   WE_MP_RSS_URL   Base URL of your we-mp-rss instance (default: http://localhost:8001)
 *   WE_MP_RSS_AK_SK Access Key : Secret Key for API auth (e.g., "abc123:xyz789")
 *                    Create via Web UI → Access Key Management
 *
 * Usage:
 *   export WE_MP_RSS_URL=http://localhost:8001
 *   export WE_MP_RSS_AK_SK=your_access_key:your_secret_key
 *   opencli we-mp-rss search "AI"              # 搜索公众号
 *   opencli we-mp-rss subs                     # 列出已订阅公众号
 *   opencli we-mp-rss articles <mp_id>         # 获取公众号文章列表
 *   opencli we-mp-rss add "公众号名称"          # 添加订阅
 *   opencli we-mp-rss refresh <mp_id>          # 手动刷新文章
 *   opencli we-mp-rss tags                     # 列出标签
 *   opencli we-mp-rss rss                      # 列出 RSS 订阅源
 *   opencli we-mp-rss feeds                    # 列出所有 RSS feed (同 rss)
 */
export {};
