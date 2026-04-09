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
 *   opencli we-mp-rss-sync search <keyword>
 *   opencli we-mp-rss-sync articles <mp_id> --limit 10
 *
 * 环境变量:
 *   WE_MP_RSS_URL        we-mp-rss 服务地址 (默认: http://localhost:8001)
 *   WE_MP_RSS_USERNAME   用户名 (默认: admin)
 *   WE_MP_RSS_PASSWORD   密码 (默认: admin123)
 *   WE_MP_RSS_AK_SK     API 认证密钥 (AK-SK 格式)
 *   WE_MP_RSS_VAULT      Obsidian vault 路径 (也可以用 --vault 参数)
 *
 * API 文档: 内置 openapi_full.json (116 个 endpoints)
 * 详细文档: API_DOC.md
 */
export interface Subscription {
    mp_id: string;
    mp_name: string;
    alias: string;
    status: 'active' | 'inactive';
    refresh_interval?: number;
}
export interface Article {
    article_id: string;
    title: string;
    author: string;
    publish_time: string | number;
    url: string;
    content?: string;
    content_html?: string;
    mp_name: string;
    mp_id: string;
}
export interface SyncState {
    [mp_id: string]: {
        last_sync: string;
        last_article_id: string;
    };
}
export interface WeMpRssConfig {
    baseUrl: string;
    apiBase: string;
    username: string;
    password: string;
    akSk: string;
    vault: string;
    subsFolder: string;
    articlesFolder: string;
    stateFile: string;
}
export interface CliResult {
    alias: string;
    status: string;
    new_articles: number;
    files: string;
}
export {};
