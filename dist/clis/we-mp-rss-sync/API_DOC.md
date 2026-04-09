# We-MP-RSS API Documentation

**Version:** 1.0.0
**Base URL:** /api/v1/wx

## Endpoints (116)

### GET /api/v1/wx/articles
_获取文章列表_

### POST /api/v1/wx/articles
_获取文章列表_

### DELETE /api/v1/wx/articles/clean
_清理无效文章(MP_ID不存在于Feeds表中的文章)_

### DELETE /api/v1/wx/articles/clean_duplicate_articles
_清理重复文章_

### GET /api/v1/wx/articles/refresh/tasks/{task_id}
_查询文章刷新任务状态_

### GET /api/v1/wx/articles/{article_id}
_获取文章详情_

### DELETE /api/v1/wx/articles/{article_id}
_删除文章_

### PUT /api/v1/wx/articles/{article_id}/favorite
_改变文章收藏状态_

### GET /api/v1/wx/articles/{article_id}/next
_获取下一篇文章_

### GET /api/v1/wx/articles/{article_id}/prev
_获取上一篇文章_

### PUT /api/v1/wx/articles/{article_id}/read
_改变文章阅读状态_

### POST /api/v1/wx/articles/{article_id}/refresh
_刷新单篇文章_

### POST /api/v1/wx/auth/ak/create
_创建 Access Key_

为当前用户创建 Access Key

用法示例：
```
POST /api/v1/auth/ak/create
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "我的API密钥",
    "description": "用于RSS同步的API密钥",
    "permissions": ["article:read", "article:sync"],
    "expires_in_days": 365
}
```

### GET /api/v1/wx/auth/ak/list
_获取 Access Keys 列表_

获取当前用户的所有 Access Keys

用法示例：
```
GET /api/v1/auth/ak/list
Authorization: Bearer {token}
```

### PUT /api/v1/wx/auth/ak/{ak_id}
_更新 Access Key_

更新 Access Key 信息

用法示例：
```
PUT /api/v1/auth/ak/{ak_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "新的AK名称",
    "description": "新的描述",
    "is_active": true
}
```

### DELETE /api/v1/wx/auth/ak/{ak_id}
_删除 Access Key_

删除 Access Key

用法示例：
```
DELETE /api/v1/auth/ak/{ak_id}
Authorization: Bearer {token}
```

### POST /api/v1/wx/auth/ak/{ak_id}/deactivate
_停用 Access Key_

停用 Access Key（保留记录但不能使用）

用法示例：
```
POST /api/v1/auth/ak/{ak_id}/deactivate
Authorization: Bearer {token}
```

### POST /api/v1/wx/auth/login
_用户登录_

### POST /api/v1/wx/auth/logout
_用户注销_

### POST /api/v1/wx/auth/password/reset
_重置密码_

使用验证码重置密码

用法示例：
```
POST /api/v1/auth/password/reset
Content-Type: application/json

{
    "username": "your_username",
    "code": "123456",
    "new_password": "new_password_123"
}
```

### POST /api/v1/wx/auth/password/reset-request
_请求密码重置验证码_

请求密码重置验证码

验证码将通过系统通知（钉钉/飞书/微信等）发送给管理员

用法示例：
```
POST /api/v1/auth/password/reset-request
Content-Type: application/json

{
    "username": "your_username"
}
```

### GET /api/v1/wx/auth/qr/code
_获取登录二维码_

### GET /api/v1/wx/auth/qr/image
_获取登录二维码图片_

### GET /api/v1/wx/auth/qr/over
_扫码完成_

### GET /api/v1/wx/auth/qr/status
_获取扫描状态_

### POST /api/v1/wx/auth/refresh
_刷新Token_

### POST /api/v1/wx/auth/token
_获取Token_

### GET /api/v1/wx/auth/verify
_验证Token有效性_

验证当前token是否有效

### GET /api/v1/wx/cascade/allocations
_查看任务分配情况_

查看任务分配情况（从数据库读取）

参数:
    task_id: 按任务ID筛选
    node_id: 按节点ID筛选
    status: 按状态筛选 (pending, claimed, executing, completed, failed, timeout)
    limit: 每页数量
    offset: 偏移量

### POST /api/v1/wx/cascade/claim-task
_子节点认领任务（原子操作，支持互斥）_

子节点认领任务（原子操作，支持任务互斥）

使用数据库事务确保同一时间只有一个节点能获取同一任务。
子节点收到任务后，其他节点不能再收到该任务。

需要级联认证（AK/SK）

### POST /api/v1/wx/cascade/dispatch-task
_手动触发任务分发_

手动触发任务分发（父节点使用）

将任务分配给各个在线的子节点

### GET /api/v1/wx/cascade/feed-status
_查看各公众号更新状态_

查看各公众号的更新状态

返回每个公众号的：
- 基本信息
- 最近抓取时间
- 文章数量
- 最后执行的任务状态和执行节点

### GET /api/v1/wx/cascade/feeds
_获取父节点公众号数据_

子节点从父节点拉取公众号数据

需要级联认证

### POST /api/v1/wx/cascade/heartbeat
_心跳接口_

子节点心跳接口

用于保持连接活跃，并可注册回调地址

### GET /api/v1/wx/cascade/message-tasks
_获取父节点消息任务_

子节点从父节点拉取消息任务

需要级联认证

### POST /api/v1/wx/cascade/nodes
_创建级联节点_

创建级联节点

- node_type=0: 父节点 (本节点)
- node_type=1: 子节点 (需要连接到父节点)

### GET /api/v1/wx/cascade/nodes
_获取节点列表_

获取级联节点列表

参数:
    node_type: 可选，按节点类型筛选 (0=父节点, 1=子节点)

### GET /api/v1/wx/cascade/nodes/{node_id}
_获取节点详情_

### PUT /api/v1/wx/cascade/nodes/{node_id}
_更新节点_

### DELETE /api/v1/wx/cascade/nodes/{node_id}
_删除节点_

### POST /api/v1/wx/cascade/nodes/{node_id}/credentials
_生成节点凭证_

为子节点生成连接父节点的凭证 (AK/SK)
仅返回一次，请妥善保存

### POST /api/v1/wx/cascade/nodes/{node_id}/test-connection
_测试节点连接_

测试子节点到父节点的连接

如果提供req参数，使用提供的凭证测试
否则使用节点配置中的凭证

### POST /api/v1/wx/cascade/notify
_接收父节点通知（子节点使用）_

子节点接收父节点的任务通知

当网关有新任务时，会主动通知子节点来认领

### GET /api/v1/wx/cascade/pending-allocations
_查看待认领的任务数量_

查看待认领的任务数量

网关可以查看当前有多少任务等待子节点认领

### GET /api/v1/wx/cascade/pending-tasks
_子节点获取待处理任务（旧接口，建议使用claim-task）_

子节点从父节点获取分配的任务（旧接口）

建议使用 POST /claim-task 接口，支持任务互斥

### POST /api/v1/wx/cascade/reload-scheduler
_重载网关定时调度任务_

重载网关定时调度任务

### POST /api/v1/wx/cascade/report-completion
_子节点上报任务完成_

子节点上报任务完成结果

参数:
    allocation_id: 分配记录ID
    task_id: 任务ID
    results: 执行结果列表
    article_count: 文章数量

### POST /api/v1/wx/cascade/report-result
_上报任务执行结果_

子节点向父节点上报任务执行结果

需要级联认证

### POST /api/v1/wx/cascade/start-scheduler
_启动网关定时调度服务_

启动网关定时调度服务

根据 MessageTask 的 cron 表达式定时下发任务

### POST /api/v1/wx/cascade/stop-scheduler
_停止网关定时调度服务_

停止网关定时调度服务

### GET /api/v1/wx/cascade/sync-logs
_获取同步日志_

获取同步日志

参数:
    node_id: 可选，按节点ID筛选
    operation: 可选，按操作类型筛选
    limit: 每页数量
    offset: 偏移量

### PUT /api/v1/wx/cascade/task-status
_更新任务分配状态_

子节点更新任务分配状态

参数:
    allocation_id: 分配记录ID
    status: 状态 (executing, completed, failed)
    error_message: 错误信息（可选）

### POST /api/v1/wx/cascade/upload-articles
_子节点上行文章数据到网关_

子节点上行文章数据到网关

子节点执行抓取任务后，将文章数据上传到父节点保存。

参数:
    allocation_id: 任务分配ID
    articles: 文章列表

### GET /api/v1/wx/configs
_获取配置项列表_

获取配置项列表

### POST /api/v1/wx/configs
_创建配置项_

### GET /api/v1/wx/configs/{config_key}
_获取单个配置项详情_

### PUT /api/v1/wx/configs/{config_key}
_更新配置项_

### DELETE /api/v1/wx/configs/{config_key}
_删除配置项_

### GET /api/v1/wx/env-exception/stats
_获取环境异常统计_

获取指定日期的环境异常统计信息

### GET /api/v1/wx/env-exception/today
_获取今日环境异常统计_

获取今天的环境异常统计信息

### GET /api/v1/wx/export/mps/export
_导出公众号列表_

### POST /api/v1/wx/export/mps/import
_导入公众号列表_

### GET /api/v1/wx/export/mps/opml
_导出公众号列表为OPML格式_

### GET /api/v1/wx/export/tags
_导出标签列表_

### POST /api/v1/wx/export/tags/import
_导入标签列表_

### GET /api/v1/wx/filter-rules
_获取过滤规则列表_

获取过滤规则列表，支持按公众号筛选

### POST /api/v1/wx/filter-rules
_创建过滤规则_

为指定公众号创建过滤规则，支持多公众号

### GET /api/v1/wx/filter-rules/mp/{mp_id}/active
_获取公众号的启用规则_

获取指定公众号的所有启用的过滤规则（支持多公众号匹配和全局规则）

### GET /api/v1/wx/filter-rules/{rule_id}
_获取过滤规则详情_

获取单个过滤规则详情

### PUT /api/v1/wx/filter-rules/{rule_id}
_更新过滤规则_

更新过滤规则

### DELETE /api/v1/wx/filter-rules/{rule_id}
_删除过滤规则_

删除过滤规则

### GET /api/v1/wx/github/branches
_获取所有分支_

获取仓库的所有分支列表

- **path**: 可选的仓库路径，默认为项目根目录

返回本地和远程分支的列表

### GET /api/v1/wx/github/commits
_获取提交历史_

获取提交历史记录

- **limit**: 返回的提交数量，默认为 10
- **path**: 可选的仓库路径，默认为项目根目录

返回最近的提交记录，包括提交哈希、消息、作者和日期

### POST /api/v1/wx/github/rollback
_回滚到指定提交_

回滚代码到指定的提交

- **commit_hash**: 目标提交的完整哈希值
- **path**: 可选的仓库路径，默认为项目根目录

**警告**: 此操作会永久丢失当前提交之后的更改，请谨慎使用

### GET /api/v1/wx/github/status
_检查 Git 仓库状态_

检查当前 Git 仓库的状态

- **path**: 可选的仓库路径，默认为项目根目录

返回仓库的详细状态信息，包括当前分支、是否有未提交更改、与远程的差异等

### POST /api/v1/wx/github/update
_从 GitHub 更新代码_

从 GitHub 仓库更新代码

- **branch**: 目标分支，默认为当前分支
- **backup**: 是否在更新前创建备份，默认为 True
- **path**: 可选的仓库路径，默认为项目根目录

更新过程包括：
1. 检查仓库状态
2. 创建备份（可选）
3. 获取远程更新
4. 执行代码更新

### GET /api/v1/wx/message_tasks
_获取消息任务列表_

### POST /api/v1/wx/message_tasks
_创建消息任务_

创建新消息任务

参数:
    task_data: 消息任务创建数据
    db: 数据库会话
    current_user: 当前认证用户
    
返回:
    201: 包含新创建消息任务的响应
    400: 请求数据验证失败
    500: 数据库操作异常

### PUT /api/v1/wx/message_tasks/job/fresh
_重载任务_

重载任务

### POST /api/v1/wx/message_tasks/message/test/{task_id}
_测试消息_

### GET /api/v1/wx/message_tasks/{task_id}
_获取单个消息任务详情_

### PUT /api/v1/wx/message_tasks/{task_id}
_更新消息任务_

### DELETE /api/v1/wx/message_tasks/{task_id}
_删除消息任务_

删除消息任务

参数:
    task_id: 要删除的消息任务ID
    db: 数据库会话
    current_user: 当前认证用户
    
返回:
    204: 成功删除，无返回内容
    404: 消息任务不存在
    500: 数据库操作异常

### GET /api/v1/wx/message_tasks/{task_id}/run
_执行单个消息任务详情_

执行单个消息任务详情

参数:
    task_id: 消息任务ID
    db: 数据库会话
    current_user: 当前认证用户
    
返回:
    包含消息任务详情的成功响应，或错误响应
    
异常:
    404: 消息任务不存在
    500: 数据库查询异常

### GET /api/v1/wx/mps
_获取公众号列表_

### POST /api/v1/wx/mps
_添加公众号_

### POST /api/v1/wx/mps/by_article
_通过文章链接获取公众号详情_

### POST /api/v1/wx/mps/featured/article
_添加精选文章_

### GET /api/v1/wx/mps/featured/article/tasks/{task_id}
_查询精选文章添加任务状态_

### GET /api/v1/wx/mps/search/{kw}
_搜索公众号_

### GET /api/v1/wx/mps/update/{mp_id}
_更新公众号文章_

### GET /api/v1/wx/mps/{mp_id}
_获取公众号详情_

### DELETE /api/v1/wx/mps/{mp_id}
_删除订阅号_

### PUT /api/v1/wx/mps/{mp_id}
_更新订阅号状态_

### GET /api/v1/wx/sys/base_info
_常规信息_

### GET /api/v1/wx/sys/info
_获取系统信息_

获取当前系统的各种信息

Returns:
    BaseResponse格式的系统信息，包括:
    - os: 操作系统信息
    - python_version: Python版本
    - uptime: 服务器运行时间(秒)
    - system: 系统详细信息

### GET /api/v1/wx/sys/resources
_获取系统资源使用情况_

获取系统资源使用情况

Returns:
    BaseResponse格式的资源使用信息，包括:
    - cpu: CPU使用率(%)
    - memory: 内存使用情况
    - disk: 磁盘使用情况

### GET /api/v1/wx/tags
_获取标签列表_

分页获取所有标签信息

### POST /api/v1/wx/tags
_创建新标签_

创建一个新的标签

### GET /api/v1/wx/tags/{tag_id}
_获取单个标签详情_

根据标签ID获取标签详细信息

### PUT /api/v1/wx/tags/{tag_id}
_更新标签信息_

根据标签ID更新标签信息

### DELETE /api/v1/wx/tags/{tag_id}
_删除标签_

根据标签ID删除标签

### POST /api/v1/wx/task-queue/clear
_清空任务队列_

清空任务队列中的所有待执行任务

注意: 正在执行的任务不会被中断

### GET /api/v1/wx/task-queue/history
_获取任务执行历史_

获取任务执行历史记录

参数:
    limit: 返回记录数量，默认20条

### POST /api/v1/wx/task-queue/history/clear
_清空任务历史_

清空任务执行历史记录

### GET /api/v1/wx/task-queue/scheduler/jobs
_获取定时任务列表_

获取所有定时任务的详细信息

### GET /api/v1/wx/task-queue/scheduler/status
_获取调度器状态_

获取定时任务调度器的状态信息

返回:
    - running: 调度器是否运行中
    - job_count: 定时任务数量
    - next_run_times: 各任务下次执行时间

### GET /api/v1/wx/task-queue/status
_获取任务队列状态_

获取任务队列的详细状态信息

返回:
    - tag: 队列标签
    - is_running: 是否运行中
    - pending_count: 待执行任务数
    - pending_tasks: 待执行任务列表
    - current_task: 当前执行的任务
    - history_count: 历史记录总数
    - recent_history: 最近执行记录

### POST /api/v1/wx/tools/export/articles
_导出文章_

导出文章为多种格式（使用线程池异步处理）

### DELETE /api/v1/wx/tools/export/delete
_删除导出文件_

删除指定的导出文件

### DELETE /api/v1/wx/tools/export/delete-by-query
_删除导出文件(查询参数)_

删除指定的导出文件（通过查询参数）

### GET /api/v1/wx/tools/export/download
_下载导出文件_

下载导出的文件

### GET /api/v1/wx/tools/export/list
_获取导出文件列表_

获取指定公众号的导出文件列表

### POST /api/v1/wx/tools/image/crop
_图片裁剪_

图片裁剪接口

支持三种图片输入方式（优先级从高到低）：
1. file: 上传文件
2. image_url: 图片URL地址
3. image_base64: Base64编码的图片

裁剪参数：
- aspect_ratio: 目标比例，如 '16:9', '4:3', '1:1' 或自定义 '800:600'
- width/height: 目标尺寸（可选，同时指定会缩放到精确尺寸）
- mode: 裁剪方式
  - center: 居中裁剪
  - top: 顶部裁剪
  - bottom: 底部裁剪
  - left: 左侧裁剪
  - right: 右侧裁剪
  - top-left: 左上角裁剪
  - top-right: 右上角裁剪
  - bottom-left: 左下角裁剪
  - bottom-right: 右下角裁剪
- output_format: 输出格式 (png/jpeg/webp)
- return_base64: 是否返回base64，默认返回文件下载

### GET /api/v1/wx/tools/image/download/{filename}
_下载裁剪后的图片_

下载裁剪后的图片

### GET /api/v1/wx/tools/image/proxy
_代理下载远程图片_

代理下载远程图片，支持裁剪

- url: 图片URL地址（需要URL编码）
- aspect_ratio: 目标比例，如 '16:9'
- width/height: 目标尺寸
- mode: 裁剪方式 (center/top/bottom/left/right/top-left/top-right/bottom-left/bottom-right)
- output_format: 输出格式

### GET /api/v1/wx/user
_获取用户信息_

### PUT /api/v1/wx/user
_修改用户资料_

修改用户基本信息(不包括密码)

### POST /api/v1/wx/user
_添加用户_

添加新用户

### POST /api/v1/wx/user/avatar
_上传用户头像_

处理用户头像上传

### GET /api/v1/wx/user/list
_获取用户列表_

获取所有用户列表（仅管理员可用）

### PUT /api/v1/wx/user/password
_修改密码_

修改用户密码

### POST /api/v1/wx/user/upload
_上传文件_

处理用户文件上传

### GET /feed/search/{kw}/{feed_id}.{ext}
_获取公众号文章源_

### GET /feed/tag/{tag_id}.{ext}
_获取公众号文章源_

### GET /feed/{feed_id}.{ext}
_获取公众号文章源_

### GET /rss
_获取RSS订阅列表_

### GET /rss/content/{content_id}
_获取缓存的文章内容_

### GET /rss/fresh
_更新并获取RSS订阅列表_

### GET /rss/{feed_id}
_获取公众号文章_

### GET /rss/{feed_id}/api
_获取特定RSS源详情_

### GET /rss/{feed_id}/fresh
_更新并获取公众号文章RSS_

### DELETE /static/res/logo/{path}
_Reverse Proxy_

### PUT /static/res/logo/{path}
_Reverse Proxy_

### PATCH /static/res/logo/{path}
_Reverse Proxy_

### GET /static/res/logo/{path}
_Reverse Proxy_

### POST /static/res/logo/{path}
_Reverse Proxy_

### GET /views/article/{article_id}
_文章详情页_

文章详情页面

### GET /views/articles
_文章列表页_

文章列表页面，支持筛选、搜索和排序

### GET /views/home
_首页 - 显示所有标签_

首页显示所有标签，支持分页

### GET /views/mps
_公众号 - 显示所有公众号_

首页显示所有公众号，支持分页

### GET /views/tag/{tag_id}
_标签详情页_

显示标签详情和关联的文章列表

### GET /views/tags
_标签 - 显示所有标签_

首页显示所有标签，支持分页

