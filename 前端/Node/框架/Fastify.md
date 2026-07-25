# Fastify

Fastify 是强调性能、低开销与 schema 驱动的 Node Web 框架。其插件封装、请求/响应 schema、序列化和类型支持适合结构化 API 服务。

## 核心机制

- 路由可声明 `schema`，用于参数、请求体、响应的校验和序列化；应把 schema 当作 API 契约的一部分维护。
- 插件通过 `register` 进行封装，默认作用域隔离有助于控制装饰器、hook 和配置影响范围。
- 生命周期 Hook 可用于认证、日志、校验后处理等；选择合适 hook，避免重复解析请求体或在过晚阶段拒绝请求。

```ts
fastify.post('/users', {
  schema: { body: userSchema, response: { 201: userResponseSchema } },
  handler: async (request, reply) => {
    const user = await service.create(request.body)
    return reply.code(201).send(user)
  },
})
```

## 实践要点与选型

- schema 可降低无效请求进入业务层的概率，并规范响应形状；仍要在业务层做权限、唯一性和跨字段规则校验。
- 使用官方/社区插件时确认 Fastify 主版本兼容性，避免复制 Express 中间件用法。
- 适合高吞吐 JSON API、希望以 schema 统一校验和序列化的团队。性能收益要用压测和真实下游数据验证，数据库或网络往往才是主瓶颈。

## 基本使用

```bash
npm i fastify
```

```ts
import Fastify from 'fastify'

const app = Fastify({ logger: true })
app.get('/users/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string', minLength: 1 } },
    },
  },
}, async (request, reply) => {
  const user = await userService.find(request.params.id)
  return user ? { data: user } : reply.code(404).send({ code: 'USER_NOT_FOUND' })
})

await app.listen({ port: 3000, host: '0.0.0.0' })
```

生产中建议通过 TypeBox、Zod 等方案让运行时 schema 与 TypeScript 类型尽量保持单一来源，避免类型与校验规则逐渐漂移。

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 高吞吐、低开销，schema 校验与序列化是一等能力 | 学习插件封装、生命周期和 JSON Schema 需要时间 |
| 插件作用域有助于模块隔离 | Express 中间件与心智模型不能直接照搬 |
| TypeScript、日志和 API 契约实践较友好 | 复杂领域架构仍需自行设计，性能不是唯一指标 |

## 注意事项

- schema 只校验协议层输入/输出，不能取代权限、业务约束和事务一致性判断。
- 使用 `register` 划分插件边界，避免在根实例随意 `decorate` 导致全局隐式依赖。
- 使用第三方插件前检查 Fastify 主版本兼容性，并用集成测试验证 Hook 与错误处理顺序。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/Express|上一篇]] · [[前端/Node/框架/Hono|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
