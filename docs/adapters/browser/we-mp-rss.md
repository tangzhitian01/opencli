# we-mp-rss (微信公众号 RSS)

**Mode**: 🔐 Browser · **Domain**: `localhost:8001` (self-hosted)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WE_MP_RSS_URL` | `http://localhost:8001` | Base URL of your we-mp-rss instance |
| `WE_MP_RSS_AK_SK` | — | Access Key : Secret Key for API auth (e.g., `abc123:xyz789`) |

Create AK-SK via Web UI → Access Key Management. If not set, uses browser session auth (cookie).

## Commands

| Command | Description |
|---------|-------------|
| `opencli we-mp-rss search` | 搜索微信公众号 |
| `opencli we-mp-rss subs` | 列出已订阅的微信公众号 |
| `opencli we-mp-rss articles` | 获取公众号文章列表 |
| `opencli we-mp-rss add` | 添加公众号订阅（通过名称） |
| `opencli we-mp-rss refresh` | 手动刷新指定公众号的文章 |
| `opencli we-mp-rss tags` | 列出所有标签 |
| `opencli we-mp-rss rss` | 列出所有 RSS 订阅源 |

## Usage Examples

```bash
# Set environment variables
export WE_MP_RSS_URL=http://localhost:8001
export WE_MP_RSS_AK_SK=your_access_key:your_secret_key

# Search for official accounts
opencli we-mp-rss search "AI"

# List subscribed accounts
opencli we-mp-rss subs

# Get articles from a specific account
opencli we-mp-rss articles <mp_id> --limit 10

# Add a new subscription
opencli we-mp-rss add "公众号名称"

# Refresh an account's articles
opencli we-mp-rss refresh <mp_id>

# List tags
opencli we-mp-rss tags

# List RSS feeds
opencli we-mp-rss rss
```

## Quick Start

```bash
# Start we-mp-rss via Docker
docker run -d --name we-mp-rss -p 8001:8001 -v ./data:/app/data ghcr.io/rachelos/we-mp-rss:latest

# Access at http://localhost:8001
# Default login: admin / admin@123
```

## Prerequisites

- Chrome running and **logged into** your we-mp-rss instance (or set `WE_MP_RSS_AK_SK`)
- [Browser Bridge extension](/guide/browser-bridge) installed
- Running we-mp-rss instance (Docker or local)
