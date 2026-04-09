/**
 * we-mp-rss-sync — Obsidian vault 与 we-mp-rss 双向同步 CLI
 *
 * 从 Obsidian vault 读取公众号订阅列表 → 同步到 we-mp-rss
 * 从 we-mp-rss 获取新文章 → 写入 Obsidian vault
 *
 * 使用方式:
 *   opencli we-mp-rss-sync sync --vault ~/Obsidian/Vault
 *   opencli we-mp-rss-sync list --vault ~/Obsidian/Vault
 *   opencli we-mp-rss-sync add "公众号名称" --vault ~/Obsidian/Vault --alias my-alias
 *
 * 环境变量:
 *   WE_MP_RSS_URL        we-mp-rss 服务地址 (默认: http://localhost:8001)
 *   WE_MP_RSS_AK_SK     API 认证密钥
 *   WE_MP_RSS_VAULT      Obsidian vault 路径 (也可以用 --vault 参数)
 */
export {};
