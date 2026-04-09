/**
 * WeWe RSS — 微信公众号订阅管理 CLI
 *
 * Usage:
 *   opencli wewe-rss subs                    # 列出所有订阅
 *   opencli wewe-rss articles <mpId>        # 获取某公众号文章列表
 *   opencli wewe-rss refresh <mpId>         # 手动刷新某公众号
 *   opencli wewe-rss add <url>              # 添加订阅（通过分享链接）
 */

import { cli, Strategy } from '../../registry.js';

cli({
  site: 'wewe-rss',
  name: 'subs',
  description: '列出所有已订阅的公众号',
  domain: 'localhost:4000',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'limit',
      type: 'int',
      default: 20,
      description: '返回数量',
    },
  ],
  columns: ['id', 'name', 'intro', 'syncTime'],
  func: async (page, kwargs) => {
    await page.goto(`http://${page.context().urls().origin}/dash`);

    // 调用 tRPC API 获取订阅列表
    const result = await page.evaluate(async (limit: number) => {
      const res = await fetch('/api/trpc/feed.list', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const feeds = data.result?.data?.json || [];
      return feeds.slice(0, limit).map((feed: any) => ({
        id: feed.id,
        name: feed.mpName,
        intro: feed.mpIntro?.substring(0, 50) || '-',
        syncTime: feed.syncTime ? new Date(feed.syncTime * 1000).toLocaleString() : '从未同步',
      }));
    }, kwargs.limit);

    return result;
  },
});

cli({
  site: 'wewe-rss',
  name: 'articles',
  description: '获取公众号文章列表',
  domain: 'localhost:4000',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'mpId',
      required: true,
      positional: true,
      description: '公众号 ID',
    },
    {
      name: 'limit',
      type: 'int',
      default: 10,
      description: '返回数量',
    },
  ],
  columns: ['id', 'title', 'publishTime'],
  func: async (page, kwargs) => {
    await page.goto(`http://${page.context().urls().origin}/dash`);

    const result = await page.evaluate(async (mpId: string, limit: number) => {
      const res = await fetch(`/api/trpc/article.list?mpId=${mpId}&limit=${limit}`, {
        credentials: 'include',
      });
      const data = await res.json();
      const articles = data.result?.data?.json || [];
      return articles.map((article: any) => ({
        id: article.id.substring(0, 16) + '...',
        title: article.title,
        publishTime: new Date(article.publishTime * 1000).toLocaleString(),
      }));
    }, kwargs.mpId, kwargs.limit);

    return result;
  },
});

cli({
  site: 'wewe-rss',
  name: 'refresh',
  description: '手动刷新指定公众号',
  domain: 'localhost:4000',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'mpId',
      required: true,
      positional: true,
      description: '公众号 ID',
    },
  ],
  columns: ['status', 'message'],
  func: async (page, kwargs) => {
    await page.goto(`http://${page.context().urls().origin}/dash`);

    const result = await page.evaluate(async (mpId: string) => {
      const res = await fetch(`/api/trpc/feed.update?id=${mpId}&update=true`, {
        credentials: 'include',
        method: 'POST',
      });
      const data = await res.json();
      return [{
        status: data.result?.data?.json?.success ? 'success' : 'error',
        message: data.result?.data?.json?.message || '刷新完成',
      }];
    }, kwargs.mpId);

    return result;
  },
});

cli({
  site: 'wewe-rss',
  name: 'add',
  description: '添加公众号订阅（通过分享链接）',
  domain: 'localhost:4000',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'url',
      required: true,
      positional: true,
      description: '公众号分享链接',
    },
  ],
  columns: ['id', 'name', 'status'],
  func: async (page, kwargs) => {
    await page.goto(`http://${page.context().urls().origin}/dash`);

    const result = await page.evaluate(async (url: string) => {
      const res = await fetch('/api/trpc/feed.create', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      const feed = data.result?.data?.json;
      if (feed) {
        return [{
          id: feed.id,
          name: feed.mpName,
          status: feed.status === 1 ? '启用' : '禁用',
        }];
      }
      return [{ id: '-', name: '添加失败', status: data.error?.message || '未知错误' }];
    }, kwargs.url);

    return result;
  },
});
