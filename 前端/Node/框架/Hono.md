# Hono

Hono 是面向多运行时的轻量 Web 框架，可运行在 Cloudflare Workers、Deno、Bun、Node.js 等环境。它强调 Web Standards、轻量路由和边缘部署兼容性。

## 核心特点

- 基于 `Request`/`Response`、Fetch API 等 Web 标准，handler 常返回 `c.json()`、`c.text()` 或 `Response`。
- 中间件使用 `async (c, next)`，可组合 CORS、认证、日志、校验等能力。
- 通过适配器支持不同运行时；选择 API 时要确认目标运行时是否提供 Node 专属能力，如文件系统、TCP、原生扩展。

```ts
import { Hono } from 'hono'

const app = new Hono()
app.get('/users/:id', (c) => c.json({ id: c.req.param('id') }))
export default app
```

## 实践要点与选型

- 在边缘环境中重视冷启动、执行时间、网络访问、数据库连接和环境变量限制，避免照搬长期运行 Node 服务的假设。
- 适合 Worker/边缘 API、轻量 BFF、跨运行时工具；大型领域模型仍需要清晰的 service、数据访问和测试层，不应只因框架轻量而把业务堆进路由。
- Hono 的框架抽象不自动解决服务端渲染、ORM、任务队列或部署平台差异，应按产品平台组合解决方案。

## 基本使用

```bash
npm i hono @hono/node-server
```

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/health', (c) => c.json({ ok: true }))
app.post('/echo', async (c) => {
  const body = await c.req.json()
  return c.json({ data: body }, 201)
})

serve({ fetch: app.fetch, port: 3000 })
```

部署到 Worker 等边缘平台时通常导出 `app` 或默认 fetch handler，而不调用 Node 专用的 `serve`。

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 跨 Node、Bun、Deno、Worker 等多运行时 | 各运行时的文件、网络、数据库能力并不一致 |
| 贴近 Web 标准，边缘部署自然 | 大型企业后端所需约定需要自行建立 |
| 轻量、冷启动友好、组合简单 | 某些传统 Node 中间件无法直接复用 |

## 注意事项

- 先确定部署运行时再选依赖，不能假设 Worker 中存在 Node `fs`、原生模块或长期 TCP 连接。
- 边缘函数通常有执行时长、内存、连接和地理分布限制；数据库连接应使用平台推荐的 HTTP/边缘兼容驱动或连接代理。
- 对 `c.req.json()`、表单和 URL 参数仍要做大小限制与 schema 校验。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/Fastify|上一篇]] · [[前端/Node/框架/Koa|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
