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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { cli, Strategy } from '../../registry.js';
// ============================================================
// Config
// ============================================================
function getConfig(kwargs) {
    return {
        baseUrl: (process.env.WE_MP_RSS_URL || 'http://localhost:8001').replace(/\/+$/, ''),
        akSk: process.env.WE_MP_RSS_AK_SK || '',
        vault: String(kwargs.vault || process.env.WE_MP_RSS_VAULT || '.'),
        subsFolder: String(kwargs.subs_folder || 'WeChat-Subscriptions'),
        articlesFolder: String(kwargs.articles_folder || 'WeChat-Articles'),
        stateFile: '.we-mp-rss-sync-state.json',
    };
}
function getHeaders(akSk) {
    const headers = { 'Content-Type': 'application/json' };
    if (akSk)
        headers['Authorization'] = `AK-SK ${akSk}`;
    return headers;
}
// ============================================================
// Frontmatter Parsing
// ============================================================
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match)
        return { data: {}, body: content };
    const yamlStr = match[1];
    const body = match[2];
    const data = {};
    // Simple YAML parsing for key: "value" or key: value
    for (const line of yamlStr.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx <= 0)
            continue;
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        data[key] = value;
    }
    return { data, body };
}
function buildFrontmatter(data) {
    const lines = Object.entries(data).map(([k, v]) => {
        if (v.includes(':') || v.includes('"') || v.includes("'") || v.includes('\n')) {
            return `${k}: "${v.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
        }
        return `${k}: ${v}`;
    });
    return `---\n${lines.join('\n')}\n---\n\n`;
}
// ============================================================
// File Operations
// ============================================================
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
function readSubscriptions(vault, subsFolder) {
    const subsDir = path.join(vault, subsFolder);
    if (!fs.existsSync(subsDir))
        return [];
    const files = fs.readdirSync(subsDir).filter(f => f.endsWith('.md'));
    const subs = [];
    for (const file of files) {
        const filePath = path.join(subsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data } = parseFrontmatter(content);
        if (data.mp_id || data.mp_name) {
            subs.push({
                mp_id: data.mp_id || '',
                mp_name: data.mp_name || data.title || file.replace(/\.md$/, ''),
                alias: data.alias || file.replace(/\.md$/, ''),
                status: data.status === 'inactive' ? 'inactive' : 'active',
                refresh_interval: data.refresh_interval ? parseInt(data.refresh_interval, 10) : undefined,
            });
        }
    }
    return subs;
}
function readSyncState(vault, stateFile) {
    const statePath = path.join(vault, stateFile);
    if (!fs.existsSync(statePath))
        return {};
    try {
        return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    catch {
        return {};
    }
}
function writeSyncState(vault, stateFile, state) {
    const statePath = path.join(vault, stateFile);
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}
function sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').substring(0, 100);
}
function writeArticleToVault(vault, articlesFolder, sub, article) {
    const subDir = path.join(vault, articlesFolder, sanitizeFilename(sub.alias));
    ensureDir(subDir);
    // Create filename from date and title
    const dateStr = article.publish_time ? article.publish_time.split(' ')[0] : new Date().toISOString().split('T')[0];
    const safeTitle = sanitizeFilename(article.title).substring(0, 80);
    const filename = `${dateStr}-${safeTitle}.md`;
    const filePath = path.join(subDir, filename);
    // Skip if already exists
    if (fs.existsSync(filePath))
        return '';
    // Build frontmatter
    const frontmatter = buildFrontmatter({
        title: article.title,
        author: article.author || '',
        publish_time: article.publish_time || '',
        source_url: article.url || '',
        mp_name: article.mp_name || sub.mp_name,
        mp_id: article.mp_id || sub.mp_id,
        synced_at: new Date().toISOString(),
    });
    // Simple HTML to markdown conversion (strip tags, basic formatting)
    let body = article.content || article.content_html || '';
    if (article.content_html) {
        body = htmlToMarkdown(body);
    }
    const mdContent = frontmatter + `# ${article.title}\n\n${body}\n`;
    fs.writeFileSync(filePath, mdContent, 'utf-8');
    return filePath;
}
function htmlToMarkdown(html) {
    // Simple HTML to basic markdown conversion
    return html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
        .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n')
        .replace(/<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*>/gi, '![$2]($1)')
        .replace(/<img[^>]*src=["'](.*?)["'][^>]*>/gi, '![]($1)')
        .replace(/<[^>]+>/g, '') // Remove remaining tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
// ============================================================
// API Calls (Node.js native fetch)
// ============================================================
async function apiFetch(baseUrl, akSk, apiPath, options = {}) {
    const url = `${baseUrl}${apiPath}`;
    const headers = getHeaders(akSk);
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body}`);
    }
    return res.json();
}
async function getSubsFromServer(baseUrl, akSk) {
    const result = await apiFetch(baseUrl, akSk, '/api/mps?limit=100');
    const list = result?.list || result?.data || [];
    return list.map((mp) => ({ mp_id: mp.mp_id || mp.id, mp_name: mp.mp_name || mp.name }));
}
async function addMpToServer(baseUrl, akSk, mpName, mpId) {
    const body = { mp_name: mpName };
    if (mpId)
        body['mp_id'] = mpId;
    return apiFetch(baseUrl, akSk, '/api/mps', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
async function getArticlesFromServer(baseUrl, akSk, mpId, limit = 50) {
    const result = await apiFetch(baseUrl, akSk, `/api/articles?mp_id=${encodeURIComponent(mpId)}&limit=${limit}&content=true`);
    const list = result?.list || result?.data || [];
    return list.map((art) => ({
        article_id: art.article_id || art.id,
        title: art.title,
        author: art.author,
        publish_time: art.publish_time || art.publishTime,
        url: art.url,
        content: art.content,
        content_html: art.content_html,
        mp_name: art.mp_name || '',
        mp_id: art.mp_id || mpId,
    }));
}
// ============================================================
// CLI Commands
// ============================================================
/**
 * sync — 同步订阅和新文章
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'sync',
    description: '同步 Obsidian 订阅到 we-mp-rss，并获取新文章写入 vault',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'vault',
            type: 'string',
            default: '.',
            help: 'Obsidian vault 路径',
        },
        {
            name: 'subs_folder',
            type: 'string',
            default: 'WeChat-Subscriptions',
            help: '订阅定义文件夹',
        },
        {
            name: 'articles_folder',
            type: 'string',
            default: 'WeChat-Articles',
            help: '文章输出文件夹',
        },
        {
            name: 'limit',
            type: 'int',
            default: 50,
            help: '每个公众号最多获取文章数',
        },
    ],
    columns: ['alias', 'status', 'new_articles', 'files'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        // 1. Read local subscriptions
        const subs = readSubscriptions(cfg.vault, cfg.subsFolder);
        if (subs.length === 0) {
            return [[{ alias: '-', status: 'no subscriptions', new_articles: 0, files: '-' }]];
        }
        // 2. Get existing server subscriptions
        let serverSubs = [];
        try {
            serverSubs = await getSubsFromServer(cfg.baseUrl, cfg.akSk);
        }
        catch (e) {
            return [[{ alias: 'error', status: String(e), new_articles: 0, files: '-' }]];
        }
        const serverMpIds = new Set(serverSubs.map(s => s.mp_id));
        // 3. Add missing subscriptions to server
        const results = [];
        const syncState = readSyncState(cfg.vault, cfg.stateFile);
        for (const sub of subs) {
            if (sub.status === 'inactive') {
                results.push({ alias: sub.alias, status: 'skipped (inactive)', new_articles: 0, files: '-' });
                continue;
            }
            // Check if mp_id is missing on server
            if (sub.mp_id && !serverMpIds.has(sub.mp_id)) {
                try {
                    await addMpToServer(cfg.baseUrl, cfg.akSk, sub.mp_name, sub.mp_id);
                }
                catch {
                    // Ignore add errors, continue with sync
                }
            }
            // Get articles for this mp
            let articles = [];
            try {
                articles = await getArticlesFromServer(cfg.baseUrl, cfg.akSk, sub.mp_id, kwargs.limit || 50);
            }
            catch {
                results.push({ alias: sub.alias, status: 'fetch error', new_articles: 0, files: '-' });
                continue;
            }
            // Filter to only new articles (based on sync state)
            const lastSync = syncState[sub.mp_id]?.last_sync;
            let newArticles = articles;
            if (lastSync) {
                const lastSyncDate = new Date(lastSync);
                newArticles = articles.filter(a => {
                    const pubDate = new Date(a.publish_time);
                    return pubDate > lastSyncDate;
                });
            }
            // Sort by publish_time descending (newest first)
            newArticles.sort((a, b) => new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime());
            // Write new articles to vault
            let writtenCount = 0;
            const writtenFiles = [];
            for (const article of newArticles) {
                const filePath = writeArticleToVault(cfg.vault, cfg.articlesFolder, sub, article);
                if (filePath) {
                    writtenCount++;
                    writtenFiles.push(path.basename(filePath));
                }
            }
            // Update sync state
            if (articles.length > 0) {
                syncState[sub.mp_id] = {
                    last_sync: new Date().toISOString(),
                    last_article_id: articles[0].article_id,
                };
            }
            results.push({
                alias: sub.alias,
                status: 'synced',
                new_articles: writtenCount,
                files: writtenFiles.length > 0 ? writtenFiles.slice(0, 3).join(', ') + (writtenFiles.length > 3 ? ` (+${writtenFiles.length - 3})` : '') : '-',
            });
        }
        // Save updated sync state
        writeSyncState(cfg.vault, cfg.stateFile, syncState);
        return results;
    },
});
/**
 * list — 列出所有订阅及其同步状态
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'list',
    description: '列出 Obsidian vault 中的所有订阅及其同步状态',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'vault',
            type: 'string',
            default: '.',
            help: 'Obsidian vault 路径',
        },
        {
            name: 'subs_folder',
            type: 'string',
            default: 'WeChat-Subscriptions',
            help: '订阅定义文件夹',
        },
    ],
    columns: ['alias', 'mp_name', 'mp_id', 'status', 'last_sync', 'articles_folder'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        const subs = readSubscriptions(cfg.vault, cfg.subsFolder);
        const syncState = readSyncState(cfg.vault, cfg.stateFile);
        if (subs.length === 0) {
            return [[{ alias: 'no subscriptions found', mp_name: '-', mp_id: '-', status: '-', last_sync: '-', articles_folder: '-' }]];
        }
        return subs.map(sub => ({
            alias: sub.alias,
            mp_name: sub.mp_name,
            mp_id: sub.mp_id,
            status: sub.status,
            last_sync: syncState[sub.mp_id]?.last_sync
                ? new Date(syncState[sub.mp_id].last_sync).toLocaleString()
                : 'never',
            articles_folder: path.join(cfg.articlesFolder, sub.alias),
        }));
    },
});
/**
 * add — 添加新订阅
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'add',
    description: '添加公众号订阅（在 vault 创建订阅文件，并同步到 we-mp-rss）',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'mp_name',
            required: true,
            positional: true,
            help: '公众号名称',
        },
        {
            name: 'vault',
            type: 'string',
            default: '.',
            help: 'Obsidian vault 路径',
        },
        {
            name: 'subs_folder',
            type: 'string',
            default: 'WeChat-Subscriptions',
            help: '订阅定义文件夹',
        },
        {
            name: 'alias',
            type: 'string',
            help: '本地文件夹别名（默认从 mp_name 生成）',
        },
        {
            name: 'mp_id',
            type: 'string',
            help: '公众号 ID（base64 编码的 biz，可选）',
        },
    ],
    columns: ['alias', 'mp_name', 'mp_id', 'status', 'file'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        const mpName = String(kwargs.mp_name);
        const alias = String(kwargs.alias || mpName).trim();
        const mpId = kwargs.mp_id ? String(kwargs.mp_id) : '';
        // Create subscription file
        const subsDir = path.join(cfg.vault, cfg.subsFolder);
        ensureDir(subsDir);
        const fileName = `${sanitizeFilename(alias)}.md`;
        const filePath = path.join(subsDir, fileName);
        // Check if already exists
        if (fs.existsSync(filePath)) {
            return [[{ alias, mp_name: mpName, mp_id: mpId || '-', status: 'already exists', file: fileName }]];
        }
        const content = `---
mp_id: "${mpId}"
mp_name: "${mpName}"
alias: "${alias}"
status: "active"
---

# ${mpName}
`;
        fs.writeFileSync(filePath, content, 'utf-8');
        // Try to add to server
        let serverStatus = 'added locally (server sync pending)';
        try {
            await addMpToServer(cfg.baseUrl, cfg.akSk, mpName, mpId);
            serverStatus = 'added to server';
        }
        catch {
            serverStatus = 'added locally (server error)';
        }
        return [[{
                    alias,
                    mp_name: mpName,
                    mp_id: mpId || '-',
                    status: serverStatus,
                    file: fileName,
                }]];
    },
});
/**
 * articles — 列出某订阅的最近文章
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'articles',
    description: '获取指定公众号的最新文章列表（不写入 vault）',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'mp_id',
            required: true,
            positional: true,
            help: '公众号 ID (mp_id)',
        },
        {
            name: 'limit',
            type: 'int',
            default: 10,
            help: '返回数量',
        },
    ],
    columns: ['title', 'author', 'publish_time', 'url'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        let articles = [];
        try {
            articles = await getArticlesFromServer(cfg.baseUrl, cfg.akSk, String(kwargs.mp_id), kwargs.limit || 10);
        }
        catch (e) {
            return [[{ title: 'error', author: String(e), publish_time: '-', url: '-' }]];
        }
        if (articles.length === 0) {
            return [[{ title: 'no articles', author: '-', publish_time: '-', url: '-' }]];
        }
        return articles.map(art => ({
            title: art.title,
            author: art.author || '-',
            publish_time: art.publish_time || '-',
            url: art.url || '-',
        }));
    },
});
