# we-mp-rss-sync (Obsidian 同步)

**Mode**: 本地 CLI · **Requires**: we-mp-rss server running

> Obsidian vault 与 we-mp-rss 之间的双向同步工具。
> 从 Obsidian vault 读取公众号订阅列表，自动订阅到 we-mp-rss，并将新文章同步回 vault。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `WE_MP_RSS_URL` | `http://localhost:8001` | we-mp-rss 服务地址 |
| `WE_MP_RSS_AK_SK` | — | API 认证密钥 |
| `WE_MP_RSS_VAULT` | — | Obsidian vault 路径（可用 `--vault` 参数覆盖） |

## 目录结构

```
Obsidian Vault/
├── WeChat-Subscriptions/      # 订阅定义文件夹
│   ├── ai-daily.md           # 每个 .md = 一个公众号
│   └── tech-weekly.md
├── WeChat-Articles/           # 同步文章输出文件夹
│   ├── ai-daily/
│   │   ├── 2024-01-01-文章标题.md
│   │   └── 2024-01-02-文章标题.md
│   └── tech-weekly/
└── .we-mp-rss-sync-state.json  # 同步状态记录
```

## 订阅文件格式

`WeChat-Subscriptions/*.md`:

```markdown
---
mp_id: "1234567890"
mp_name: "AI Daily"
alias: "ai-daily"
status: "active"
---

# AI Daily

每日 AI 资讯汇总。
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `mp_id` | 是 | 公众号 ID（在 we-mp-rss 中的标识） |
| `mp_name` | 是 | 公众号显示名称 |
| `alias` | 否 | 本地文件夹命名（默认用文件名） |
| `status` | 否 | `active`（默认）或 `inactive` |

## 命令

| 命令 | 说明 |
|------|------|
| `opencli we-mp-rss-sync sync` | 同步订阅和新文章到 vault |
| `opencli we-mp-rss-sync list` | 列出所有订阅及同步状态 |
| `opencli we-mp-rss-sync add` | 添加新订阅 |
| `opencli we-mp-rss-sync articles` | 查看某公众号最近文章（不写入） |

## 使用示例

### 首次设置

```bash
# 1. 在 vault 创建订阅文件夹
mkdir -p ~/Obsidian/Vault/WeChat-Subscriptions

# 2. 创建订阅文件
cat > ~/Obsidian/Vault/WeChat-Subscriptions/ai-daily.md << 'EOF'
---
mp_id: ""
mp_name: "AI Daily"
alias: "ai-daily"
status: "active"
---

# AI Daily
EOF

# 3. 设置环境变量
export WE_MP_RSS_URL=http://localhost:8001
export WE_MP_RSS_AK_SK=your_access_key:your_secret_key
export WE_MP_RSS_VAULT=~/Obsidian/Vault

# 4. 触发一次同步
opencli we-mp-rss-sync sync --vault ~/Obsidian/Vault
```

### 添加新订阅

```bash
opencli we-mp-rss-sync add "AI Daily" --vault ~/Obsidian/Vault --alias ai-daily
```

### 定时同步（cron）

```bash
# 每 30 分钟同步一次
*/30 * * * * opencli we-mp-rss-sync sync --vault ~/Obsidian/Vault >> /var/log/we-mp-rss-sync.log 2>&1
```

## sync 命令详解

`opencli we-mp-rss-sync sync` 执行以下步骤：

1. **读取订阅**：扫描 `{vault}/{subs_folder}/*.md`，解析 frontmatter
2. **新增订阅**：对比 we-mp-rss 服务器，自动添加缺失的公众号
3. **获取文章**：对每个 mp_id 调用 `GET /api/articles`
4. **过滤新文章**：根据 `.we-mp-rss-sync-state.json` 过滤自上次同步后的新文章
5. **写入 vault**：新文章写入 `{vault}/{articles_folder}/{alias}/{date}-{title}.md`
6. **更新状态**：更新 `.we-mp-rss-sync-state.json` 的 `last_sync` 时间戳

## 文章输出格式

每篇文章保存为独立的 `.md` 文件：

```markdown
---
title: "文章标题"
author: "作者"
publish_time: "2024-01-01 12:00:00"
source_url: "https://mp.weixin.qq.com/s/xxx"
mp_name: "AI Daily"
mp_id: "1234567890"
synced_at: "2024-01-01T14:00:00.000Z"
---

# 文章标题

正文内容（HTML 已转为 Markdown）...
```
