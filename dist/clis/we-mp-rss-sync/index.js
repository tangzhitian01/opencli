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
 *   opencli we-mp-rss-sync articles <mp_id> --limit 10
 *
 * 环境变量:
 *   WE_MP_RSS_URL        we-mp-rss 服务地址 (默认: http://localhost:8001)
 *   WE_MP_RSS_USERNAME   用户名 (默认: admin)
 *   WE_MP_RSS_PASSWORD   密码 (默认: admin123)
 *   WE_MP_RSS_AK_SK     API 认证密钥 (AK-SK 格式)
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
        apiBase: '/api/v1/wx',  // Fixed API base path
        username: process.env.WE_MP_RSS_USERNAME || 'admin',
        password: process.env.WE_MP_RSS_PASSWORD || 'admin123',
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
        const strVal = String(v);
        if (strVal.includes(':') || strVal.includes('"') || strVal.includes("'") || strVal.includes('\n')) {
            return `${k}: "${strVal.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
        }
        return `${k}: ${strVal}`;
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

function sanitizeFolderName(name) {
    return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '_').substring(0, 80);
}

function formatPublishTime(publishTime) {
    if (!publishTime) return new Date().toISOString().split('T')[0];
    // If it's a number (Unix timestamp), convert to date string
    if (typeof publishTime === 'number') {
        return new Date(publishTime * 1000).toISOString().split('T')[0];
    }
    // If it's a string, try to parse and format
    try {
        const date = new Date(publishTime);
        if (isNaN(date.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

/**
 * Write article with subfolder structure (title-based folder with images inside)
 * Format: WeChat-Articles/{mp_name}/{date}-{title}/{title}.md
 * Images: WeChat-Articles/{mp_name}/{date}-{title}/images/*
 */
function writeArticleToVault(vault, articlesFolder, sub, article) {
    const subDir = path.join(vault, articlesFolder, sanitizeFilename(sub.alias));
    ensureDir(subDir);
    // Create subfolder name from date and title
    const dateStr = formatPublishTime(article.publish_time);
    const safeTitle = sanitizeFolderName(article.title).substring(0, 80);
    const subfolder = `${dateStr}-${safeTitle}`;
    const articleDir = path.join(subDir, subfolder);
    ensureDir(articleDir);
    // Filename inside subfolder
    const filename = `${subfolder}.md`;
    const filePath = path.join(articleDir, filename);
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

// Token cache
let tokenCache = null;
let tokenExpiry = 0;

async function getToken(baseUrl, username, password) {
    // Return cached token if still valid (with 5 min buffer)
    if (tokenCache && Date.now() < tokenExpiry - 300000) {
        return tokenCache;
    }

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${baseUrl}/api/v1/wx/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Login failed: HTTP ${res.status} ${body}`);
    }

    const data = await res.json();
    if (data.code !== 0 || !data.data?.access_token) {
        throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
    }

    tokenCache = data.data.access_token;
    // Token typically expires in 7 days, cache for 1 hour
    tokenExpiry = Date.now() + 3600000;

    return tokenCache;
}

async function apiFetch(baseUrl, apiBase, akSk, username, password, apiPath, options = {}) {
    let url = `${baseUrl}${apiBase}${apiPath}`;
    const headers = getHeaders(akSk);

    // If no AK-SK, use login token
    if (!akSk) {
        try {
            const token = await getToken(baseUrl, username, password);
            headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
            throw new Error(`Failed to authenticate: ${e.message}`);
        }
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body}`);
    }
    return res.json();
}

// Refresh article content via API (slow, polling required)
async function refreshArticleContent(baseUrl, apiBase, akSk, username, password, articleId, maxWaitMs = 30000) {
    const refreshResult = await apiFetch(baseUrl, apiBase, akSk, username, password, `/articles/${encodeURIComponent(articleId)}/refresh`, { method: 'POST' });
    if (refreshResult.code !== 0 || !refreshResult.data?.task_id) {
        throw new Error(refreshResult.message || 'Failed to start refresh');
    }

    const taskId = refreshResult.data.task_id;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        await new Promise(r => setTimeout(r, 1000));
        const statusResult = await apiFetch(baseUrl, apiBase, akSk, username, password, `/articles/refresh/tasks/${taskId}`);
        const status = statusResult.data?.status;
        if (status === 'completed' || status === 'failed') break;
    }

    const articleResult = await apiFetch(baseUrl, apiBase, akSk, username, password, `/articles/${encodeURIComponent(articleId)}`);
    return articleResult.data;
}

// Execute external command and return output
async function execCommand(cmd, args) {
    return new Promise((resolve, reject) => {
        const { spawn } = require('node:child_process');
        const child = spawn(cmd, args, { shell: true });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => stdout += d);
        child.stderr.on('data', d => stderr += d);
        child.on('close', code => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`${cmd} ${args.join(' ')} failed: ${stderr || stdout}`));
        });
        child.on('error', reject);
    });
}

/**
 * Download article using weixin adapter (via opencli)
 * Returns: { success: true, folder: 'folder path', title: '...' }
 */
async function downloadArticleViaWeixin(url, outputBaseDir) {
    try {
        const result = await execCommand('opencli', [
            'weixin', 'download',
            '--url', url,
            '--output', outputBaseDir,
        ]);
        // Parse output to find title (table format: │ Title │ ... │)
        const lines = result.split('\n');
        for (const line of lines) {
            if (line.includes('│') && !line.includes('───') && !line.includes('Title')) {
                const parts = line.split('│').filter(p => p.trim());
                if (parts.length >= 1) {
                    const title = parts[0].trim();
                    if (title && title.length > 5 && title.length < 200) {
                        const titleSafe = sanitizeFolderName(title);
                        const folderPath = path.join(outputBaseDir, titleSafe);
                        if (fs.existsSync(folderPath)) {
                            return { success: true, folder: folderPath, title };
                        }
                    }
                }
            }
        }
        return { success: false, error: 'Could not find downloaded folder' };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Fetch article content directly from WeChat URL (fast!)
async function fetchContentFromUrl(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });
        const html = await res.text();

        // Extract content from js_content div
        const match = html.match(/id="js_content"([^<]*(?:<(?!js_content|js_pc_qr_code)[^>]*>]*)*)/i);
        if (!match) return '';

        let content = match[1];
        // Convert HTML to plain text but keep some structure
        content = content
            .replace(/<p[^>]*>/gi, '\n\n')
            .replace(/<\/p>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<li[^>]*>/gi, '\n• ')
            .replace(/<\/li>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return content;
    } catch (e) {
        return '';
    }
}

// Get article with content - try direct URL fetch first, fallback to API refresh
async function getArticleWithContent(baseUrl, apiBase, akSk, username, password, articleId, articleUrl) {
    // First try to get article directly from API
    let articleResult = await apiFetch(baseUrl, apiBase, akSk, username, password, `/articles/${encodeURIComponent(articleId)}`);
    let article = articleResult.data || {};

    // Check if API has content
    const hasApiContent = (article.content || article.content_html || '').length > 100;

    if (hasApiContent) {
        return article;
    }

    // Try to fetch content from original URL
    if (articleUrl) {
        const urlContent = await fetchContentFromUrl(articleUrl);
        if (urlContent.length > 100) {
            return { ...article, content: urlContent, content_html: '' };
        }
    }

    // Last resort: use API refresh (slow)
    if (!hasApiContent) {
        try {
            article = await refreshArticleContent(baseUrl, apiBase, akSk, username, password, articleId);
        } catch (e) {
            // Ignore refresh errors
        }
    }

    return article;
}

// Helper to extract list from API response (handles different response formats)
function extractList(response) {
    if (!response) return [];
    // Format: { code: 0, data: { list: [...] } }
    if (response.data?.list) return response.data.list;
    // Format: { code: 0, data: [...] }
    if (Array.isArray(response.data)) return response.data;
    // Format: { list: [...] }
    if (response.list) return response.list;
    // Format: [...]
    if (Array.isArray(response)) return response;
    return [];
}

async function getSubsFromServer(baseUrl, apiBase, akSk, username, password) {
    const result = await apiFetch(baseUrl, apiBase, akSk, username, password, '/mps?limit=100');
    const list = extractList(result);
    return list.map((mp) => ({
        mp_id: mp.mp_id || mp.id,
        mp_name: mp.mp_name || mp.name,
    }));
}

async function addMpToServer(baseUrl, apiBase, akSk, username, password, mpName, mpId) {
    const body = { mp_name: mpName };
    if (mpId)
        body['mp_id'] = mpId;
    return apiFetch(baseUrl, apiBase, akSk, username, password, '/mps', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

async function getArticlesFromServer(baseUrl, apiBase, akSk, username, password, mpId, limit = 50) {
    const result = await apiFetch(baseUrl, apiBase, akSk, username, password, `/articles?mp_id=${encodeURIComponent(mpId)}&limit=${limit}&content=true`);
    const list = extractList(result);
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

async function searchMps(baseUrl, apiBase, akSk, username, password, keyword) {
    const result = await apiFetch(baseUrl, apiBase, akSk, username, password, `/mps/search/${encodeURIComponent(keyword)}`);
    const list = extractList(result);
    return list.map((mp) => ({
        mp_id: mp.mp_id || mp.id,
        mp_name: mp.mp_name || mp.name,
        mp_intro: mp.mp_intro || '',
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
        {
            name: 'use_weixin',
            type: 'boolean',
            default: false,
            help: '使用微信下载器获取完整内容(含图片)',
        },
    ],
    columns: ['alias', 'status', 'new_articles', 'files'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        const useWeixin = kwargs.use_weixin || false;
        // 1. Read local subscriptions
        const subs = readSubscriptions(cfg.vault, cfg.subsFolder);
        if (subs.length === 0) {
            return [[{ alias: '-', status: 'no subscriptions', new_articles: 0, files: '-' }]];
        }
        // 2. Get existing server subscriptions
        let serverSubs = [];
        try {
            serverSubs = await getSubsFromServer(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password);
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
                    await addMpToServer(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password, sub.mp_name, sub.mp_id);
                }
                catch {
                    // Ignore add errors, continue with sync
                }
            }
            // Get articles for this mp
            let articles = [];
            try {
                articles = await getArticlesFromServer(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password, sub.mp_id, kwargs.limit || 50);
            }
            catch (e) {
                results.push({ alias: sub.alias, status: `fetch error: ${e.message}`, new_articles: 0, files: '-' });
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
                const articleUrl = article.url;
                if (!articleUrl) continue;

                if (useWeixin) {
                    // Use weixin downloader (gets full content + images)
                    const subDir = path.join(cfg.vault, cfg.articlesFolder, sanitizeFilename(sub.alias));
                    const downloadResult = await downloadArticleViaWeixin(articleUrl, subDir);
                    if (downloadResult.success) {
                        writtenCount++;
                        writtenFiles.push(path.basename(downloadResult.folder));
                    }
                } else {
                    // Get full article content via API/URL fetch
                    const fullArticle = await getArticleWithContent(
                        cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password,
                        article.article_id || article.id,
                        articleUrl
                    );
                    // Merge content into article object
                    const articleWithContent = {
                        ...article,
                        content: fullArticle?.content || article.content || '',
                        content_html: fullArticle?.content_html || article.content_html || '',
                    };
                    const filePath = writeArticleToVault(cfg.vault, cfg.articlesFolder, sub, articleWithContent);
                    if (filePath) {
                        writtenCount++;
                        writtenFiles.push(path.basename(filePath));
                    }
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
                status: writtenCount > 0 ? 'synced' : 'up-to-date',
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
            help: '公众号 ID（可选）',
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
            await addMpToServer(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password, mpName, mpId);
            serverStatus = 'added to server';
        }
        catch (e) {
            serverStatus = `added locally (server error: ${e.message})`;
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
 * articles — 获取指定公众号的最新文章列表
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
            articles = await getArticlesFromServer(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password, String(kwargs.mp_id), kwargs.limit || 10);
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

/**
 * search — 搜索公众号
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'search',
    description: '搜索公众号',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'keyword',
            required: true,
            positional: true,
            help: '搜索关键词',
        },
    ],
    columns: ['mp_name', 'mp_id', 'mp_intro'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        let results = [];
        try {
            results = await searchMps(cfg.baseUrl, cfg.apiBase, cfg.akSk, cfg.username, cfg.password, String(kwargs.keyword));
        }
        catch (e) {
            return [[{ mp_name: 'error', mp_id: String(e), mp_intro: '-' }]];
        }
        if (results.length === 0) {
            return [[{ mp_name: 'no results', mp_id: '-', mp_intro: '-' }]];
        }
        return results.map(mp => ({
            mp_name: mp.mp_name,
            mp_id: mp.mp_id,
            mp_intro: mp.mp_intro || '-',
        }));
    },
});

/**
 * doc — 显示 API 文档
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'doc',
    description: '显示 API 文档和可用 endpoints',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [],
    columns: ['endpoint', 'method', 'description'],
    func: async () => {
        const docPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'API_DOC.md');
        if (fs.existsSync(docPath)) {
            const doc = fs.readFileSync(docPath, 'utf-8');
            return { output: doc, format: 'markdown' };
        }
        return [[{ endpoint: 'API_DOC.md not found', method: '-', description: 'Run sync at least once to download API docs' }]];
    },
});

/**
 * download — 使用微信下载器下载文章(含图片)
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'download',
    description: '使用微信下载器获取文章(包含完整图片)',
    domain: 'localhost:8001',
    strategy: Strategy.PUBLIC,
    browser: false,
    args: [
        {
            name: 'url',
            required: true,
            positional: true,
            help: '微信文章 URL (mp.weixin.qq.com/s/xxx)',
        },
        {
            name: 'vault',
            type: 'string',
            default: '.',
            help: 'Obsidian vault 路径',
        },
        {
            name: 'articles_folder',
            type: 'string',
            default: 'WeChat-Articles',
            help: '文章输出文件夹',
        },
        {
            name: 'mp_name',
            type: 'string',
            help: '公众号名称(用于文件夹)',
        },
    ],
    columns: ['title', 'folder', 'status'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        const url = String(kwargs.url);
        const mpName = kwargs.mp_name ? String(kwargs.mp_name) : 'Unknown';

        const outputDir = path.join(cfg.vault, cfg.articlesFolder, sanitizeFilename(mpName));
        ensureDir(outputDir);

        const result = await downloadArticleViaWeixin(url, outputDir);
        if (result.success) {
            return [[{
                title: result.title,
                folder: path.basename(result.folder),
                status: 'success',
            }]];
        }
        return [[{ title: url, folder: '-', status: `error: ${result.error}` }]];
    },
});

/**
 * reorganize — 将扁平文章文件重组为子文件夹结构
 * 把 WeChat-Articles/{mp}/{date}-{title}.md
 * 转为  WeChat-Articles/{mp}/{date}-{title}/{date}-{title}.md (含images子文件夹)
 */
cli({
    site: 'we-mp-rss-sync',
    name: 'reorganize',
    description: '将扁平文章重组为子文件夹结构(保持图片引用)',
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
            name: 'articles_folder',
            type: 'string',
            default: 'WeChat-Articles',
            help: '文章输出文件夹',
        },
        {
            name: 'mp_name',
            type: 'string',
            help: '只重组指定公众号(默认全部)',
        },
    ],
    columns: ['mp', 'converted', 'skipped', 'errors'],
    func: async (_page, kwargs) => {
        const cfg = getConfig(kwargs);
        const articlesDir = path.join(cfg.vault, cfg.articlesFolder);
        if (!fs.existsSync(articlesDir)) {
            return [[{ mp: '-', converted: 0, skipped: 0, errors: 'articles folder not found' }]];
        }

        const mps = fs.readdirSync(articlesDir).filter(f => {
            const isDir = fs.statSync(path.join(articlesDir, f)).isDirectory();
            if (kwargs.mp_name) return isDir && f === kwargs.mp_name;
            return isDir;
        });

        let totalConverted = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const results = [];

        for (const mp of mps) {
            const mpDir = path.join(articlesDir, mp);
            const files = fs.readdirSync(mpDir).filter(f => f.endsWith('.md'));
            let converted = 0, skipped = 0, errors = 0;

            for (const file of files) {
                const filePath = path.join(mpDir, file);
                // Skip if already a directory with same name
                const potentialDir = path.join(mpDir, file.replace(/\.md$/, ''));
                if (fs.existsSync(potentialDir) && fs.statSync(potentialDir).isDirectory()) {
                    skipped++;
                    continue;
                }

                try {
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Create subfolder
                    const subfolder = file.replace(/\.md$/, '');
                    const targetDir = path.join(mpDir, subfolder);
                    ensureDir(targetDir);
                    ensureDir(path.join(targetDir, 'images'));

                    // Write content to subfolder
                    const targetFile = path.join(targetDir, `${subfolder}.md`);
                    fs.writeFileSync(targetFile, content, 'utf-8');

                    // Remove original flat file
                    fs.unlinkSync(filePath);
                    converted++;
                } catch (e) {
                    errors++;
                }
            }
            totalConverted += converted;
            totalSkipped += skipped;
            totalErrors += errors;
            results.push({ mp, converted, skipped, errors });
        }

        return results;
    },
});

// Export API info for extensibility
export { getConfig, getToken, apiFetch, extractList, searchMps, getSubsFromServer, getArticlesFromServer, getArticleWithContent, fetchContentFromUrl, downloadArticleViaWeixin };

