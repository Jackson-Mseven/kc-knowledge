# Koa

Koa 是由 Express 原班团队推出的轻量 Node Web 框架，核心强调基于 `async`/`await` 的洋葱模型中间件。它只提供较小内核，路由、校验、鉴权等通常通过社区中间件组合。

## 洋葱模型

中间件在 `await next()` 前执行“进入”逻辑，在下游完成后执行“退出”逻辑，天然适合统一计时、事务、错误捕获和响应后处理。

```ts
app.use(async (ctx, next) => {
  const start = Date.now()
  try {
    await next()
  } catch (error) {
    ctx.status = 500
    ctx.body = { code: 'INTERNAL_ERROR' }
    ctx.app.emit('error', error, ctx)
  } finally {
    console.info(ctx.method, ctx.path, Date.now() - start)
  }
})
```

## 实践要点

- `ctx` 聚合请求和响应，使用 `ctx.state` 在当前请求链中传递认证用户等上下文。
- 中间件顺序决定语义：错误捕获通常应靠前，CORS/安全头、解析器、认证、路由和 404 处理按明确顺序组织。
- Koa 不内置路由/请求体解析等完整能力，依赖选型、版本兼容和安全配置由项目负责。

## 选型

适合希望理解并掌控中间件流、偏好简洁 async/await 模型的团队。若希望获得更多约定、schema 校验或内建生态，需要额外搭建或考虑其他框架。

## 基本使用

```bash
npm i koa @koa/router koa-bodyparser
```

```ts
import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

const app = new Koa()
const router = new Router()

router.post('/users', async (ctx) => {
  const user = await userService.create(ctx.request.body)
  ctx.status = 201
  ctx.body = { data: user }
})

app.use(bodyParser({ jsonLimit: '1mb' }))
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)
```

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 洋葱模型清晰，异常处理与后置逻辑自然 | 内核小，路由、校验、文档等需自行选择与整合 |
| 原生 async/await 风格，控制流简洁 | 团队约定不足时容易形成风格不一致的中间件堆栈 |
| 适合定制化 HTTP 服务 | TypeScript/schema 能力不是一体化默认方案 |

## 注意事项

- 牢记 `await next()` 的位置会改变中间件执行顺序；错误捕获要包裹下游中间件。
- `ctx.state` 只用于单次请求的上下文传递，不应当作全局可变状态容器。
- `router.allowedMethods()` 能返回适当的 405/501；不要把未知方法都误报为 404。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/Hono|上一篇]] · [[前端/Node/框架/Nest|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
