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
import { cli, Strategy } from '../../registry.js';
// ============================================================
// Shared helpers
// ============================================================
function getBaseUrl() {
    return (process.env.WE_MP_RSS_URL || 'http://localhost:8001').replace(/\/+$/, '');
}
function getAkSk() {
    return process.env.WE_MP_RSS_AK_SK || null;
}
function buildHeaders(akSk) {
    const headers = { 'Content-Type': 'application/json' };
    if (akSk) {
        headers['Authorization'] = `AK-SK ${akSk}`;
    }
    return headers;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch(page, path, akSk, options = {}) {
    const base = getBaseUrl();
    const url = path.startsWith('http') ? path : `${base}${path}`;
    const headers = buildHeaders(akSk);
    const headersJson = JSON.stringify(headers);
    const optionsJson = JSON.stringify(options);
    return page.evaluate(` (async () => {
      const res = await fetch(${JSON.stringify(url)}, {
        ...${optionsJson},
        headers: ${headersJson},
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + ': ' + body);
      }
      return res.json();
    })() `);
}
// ============================================================
// search — 搜索公众号
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'search',
    description: '搜索微信公众号',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        { name: 'query', required: true, positional: true, help: '搜索关键词' },
        {
            name: 'limit',
            type: 'int',
            default: 10,
            help: '返回数量 (默认 10)',
        },
    ],
    columns: ['id', 'name', 'alias', 'intro'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const result = await apiFetch(page, `/api/mps/search/${encodeURIComponent(String(kwargs.query))}?limit=${kwargs.limit}`, akSk);
        const list = result?.list || result?.data || [];
        return list.map((mp) => ({
            id: mp.mp_id || mp.id || '',
            name: mp.mp_name || mp.name || '',
            alias: mp.alias || mp.mp_alias || '',
            intro: (mp.mp_intro || mp.intro || '').substring(0, 80),
        }));
    },
});
// ============================================================
// subs — 列出已订阅公众号
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'subs',
    description: '列出已订阅的微信公众号',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        {
            name: 'limit',
            type: 'int',
            default: 20,
            help: '返回数量 (默认 20)',
        },
        {
            name: 'status',
            type: 'int',
            default: 1,
            help: '状态过滤: 1=启用, 0=禁用',
        },
    ],
    columns: ['id', 'name', 'intro', 'status', 'article_count'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const status = kwargs.status ?? 1;
        const result = await apiFetch(page, `/api/mps?limit=${kwargs.limit}&status=${status}`, akSk);
        const list = result?.list || result?.data || [];
        return list.map((mp) => ({
            id: mp.mp_id || mp.id || '',
            name: mp.mp_name || mp.name || '',
            intro: (mp.mp_intro || mp.intro || '-').substring(0, 60),
            status: mp.status === 1 ? '启用' : '禁用',
            article_count: mp.article_count || mp.articleCount || '-',
        }));
    },
});
// ============================================================
// articles — 获取公众号文章列表
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'articles',
    description: '获取公众号文章列表',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
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
            help: '返回数量 (默认 10)',
        },
        {
            name: 'search',
            type: 'string',
            help: '搜索文章标题关键词',
        },
        {
            name: 'only_favorite',
            type: 'boolean',
            default: false,
            help: '仅收藏文章',
        },
    ],
    columns: ['id', 'title', 'author', 'publish_time', 'read', 'favorite'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        let path = `/api/articles?mp_id=${kwargs.mp_id}&limit=${kwargs.limit}`;
        if (kwargs.search)
            path += `&search=${encodeURIComponent(String(kwargs.search))}`;
        if (kwargs.only_favorite)
            path += '&only_favorite=true';
        const result = await apiFetch(page, path, akSk);
        const list = result?.list || result?.data || [];
        return list.map((art) => ({
            id: (art.article_id || art.id || '').substring(0, 16) + '...',
            title: art.title || '',
            author: art.author || '-',
            publish_time: art.publish_time || art.publishTime || '-',
            read: art.is_read ? '已读' : '未读',
            favorite: art.is_favorite ? '★' : '',
        }));
    },
});
// ============================================================
// add — 添加公众号订阅
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'add',
    description: '添加公众号订阅（通过名称）',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        {
            name: 'mp_name',
            required: true,
            positional: true,
            help: '公众号名称',
        },
        {
            name: 'mp_id',
            type: 'string',
            help: '公众号 ID (base64 编码的 biz 值，可选)',
        },
    ],
    columns: ['id', 'name', 'status', 'message'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const body = { mp_name: String(kwargs.mp_name) };
        if (kwargs.mp_id)
            body['mp_id'] = String(kwargs.mp_id);
        const result = await apiFetch(page, '/api/mps', akSk, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        const mp = result;
        if (mp?.mp_id || mp?.id) {
            return [{
                    id: mp.mp_id || mp.id,
                    name: mp.mp_name || mp.name || kwargs.mp_name,
                    status: '添加成功',
                    message: '请等待首次同步完成',
                }];
        }
        return [{
                id: '-',
                name: String(kwargs.mp_name),
                status: '添加失败',
                message: mp?.message || mp?.errorMsg || JSON.stringify(mp),
            }];
    },
});
// ============================================================
// refresh — 手动刷新公众号文章
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'refresh',
    description: '手动刷新指定公众号的文章',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        {
            name: 'mp_id',
            required: true,
            positional: true,
            help: '公众号 ID',
        },
    ],
    columns: ['status', 'message'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const result = await apiFetch(page, `/api/mps/update/${kwargs.mp_id}?start_page=0&end_page=1`, akSk);
        const r = result;
        return [{
                status: r?.message?.includes('成功') || r?.success ? 'success' : 'running',
                message: r?.message || JSON.stringify(r),
            }];
    },
});
// ============================================================
// tags — 列出标签
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'tags',
    description: '列出所有标签',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        {
            name: 'limit',
            type: 'int',
            default: 50,
            help: '返回数量 (默认 50)',
        },
    ],
    columns: ['id', 'name', 'intro', 'mp_count'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const result = await apiFetch(page, `/api/tags?limit=${kwargs.limit}`, akSk);
        const list = result?.list || [];
        return list.map((tag) => ({
            id: tag.tag_id || tag.id || '',
            name: tag.name || '',
            intro: (tag.intro || '').substring(0, 60),
            mp_count: tag.mp_count || tag.mpCount || '-',
        }));
    },
});
// ============================================================
// rss / feeds — 列出 RSS 订阅源
// ============================================================
cli({
    site: 'we-mp-rss',
    name: 'rss',
    aliases: ['feeds'],
    description: '列出所有 RSS 订阅源',
    domain: 'localhost:8001',
    strategy: Strategy.COOKIE,
    browser: true,
    args: [
        {
            name: 'limit',
            type: 'int',
            default: 20,
            help: '返回数量 (默认 20)',
        },
    ],
    columns: ['feed_id', 'name', 'url', 'tag'],
    func: async (page, kwargs) => {
        const akSk = getAkSk();
        const base = getBaseUrl();
        await page.goto(`${base}/`);
        await page.wait(2);
        const result = await apiFetch(page, `/api/rss?limit=${kwargs.limit}`, akSk);
        const list = result?.list || result?.data || [];
        const baseUrl = getBaseUrl();
        return list.map((feed) => ({
            feed_id: feed.feed_id || feed.id || '',
            name: feed.name || feed.title || '',
            url: `${baseUrl}/api/feed/${feed.feed_id}.xml`,
            tag: feed.tag || '',
        }));
    },
});
