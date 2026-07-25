# Express

Express 是成熟、极简的 Node Web 框架，核心由路由与中间件组成。它生态庞大、资料丰富，适合传统 HTTP API、BFF 和需要灵活组装中间件的服务。

## 核心机制

- `app.use` 注册中间件，`app.get/post/...` 注册路由；中间件按注册顺序执行。
- 中间件通过 `(req, res, next)` 访问请求、响应并决定继续传递、结束响应或交给错误处理。
- 错误处理中间件签名为 `(err, req, res, next)`，必须位于普通路由/中间件之后。

```ts
app.use(express.json({ limit: '1mb' }))
app.get('/health', (_req, res) => res.json({ ok: true }))
app.use((err, _req, res, _next) => {
  res.status(500).json({ code: 'INTERNAL_ERROR' })
})
```

## 实践要点

- 路由层负责协议适配，业务放到 service，数据访问放到 repository/adapter，避免把所有逻辑堆在 handler。
- 统一处理参数校验、认证、授权、日志、错误格式、请求 ID 和超时。
- Express 本身不强制架构；大型项目必须自行约束目录、依赖方向、测试和配置管理。

## 选型

需要成熟生态、低学习成本和完全自由的中间件组合时选择 Express。若需要 schema 驱动高性能、强约定模块架构或边缘运行时支持，可评估 Fastify、Nest 或 Hono。

## 基本使用

```bash
npm i express
```

```ts
import express from 'express'

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await userService.find(req.params.id)
    if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' })
    res.json({ data: user })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ code: 'INTERNAL_ERROR' })
})

app.listen(3000)
```

异步路由的错误传递方式取决于所用 Express 主版本和项目封装；统一让错误进入一个错误处理中间件，并避免在响应已发送后继续写入。

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 生态成熟、资料多、学习成本低 | 内核极简，大项目架构需自行治理 |
| 中间件兼容性广、迁移遗留项目方便 | 默认不以 schema/类型为中心，TypeScript 体验需自行补齐 |
| 灵活，可按需选择库 | 性能与可观测性依赖中间件组合质量 |

## 注意事项

- `express.json()` 不是输入校验，仍需对 body、params、query 做 schema 校验。
- 中间件顺序非常重要：安全头/CORS、请求 ID、日志、解析器、认证、路由、404、错误处理应有明确顺序。
- 不要在 handler 中混合协议、业务、数据库和第三方调用；通过 service/repository 分层便于测试与替换。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/Egg|上一篇]] · [[前端/Node/框架/Fastify|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
