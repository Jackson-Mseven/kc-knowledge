# Egg

Egg 是面向企业级 Node.js 服务的约定式框架，建立在 Koa 之上，提供应用/Agent 生命周期、目录约定、插件机制、配置分层与 Service/Controller 抽象。

## 架构与约定

- `controller` 负责处理 HTTP 请求和组织响应；`service` 承载可复用业务逻辑；`middleware` 处理横切关注点；`config` 管理环境配置。
- Egg 通过 Loader 按目录和命名约定加载模块，约定减少样板，但也要求团队理解生命周期和加载时机。
- 插件用于封装数据库、缓存、鉴权、日志等能力；应用与 Agent 可在不同进程承担不同职责。

## 实践要点

- Controller 保持薄，避免直接堆叠复杂数据库与领域逻辑；Service 也应按领域边界拆分，避免成为巨型工具类。
- 配置按环境覆盖，敏感值从安全配置源注入；启动时校验必要配置。
- 评估新项目时，应确认团队当前技术栈、长期维护策略与生态兼容性。框架约定强并非缺点，但迁移和定制成本需要提前考虑。

## 选型

适合已有 Egg 经验、需要成熟企业约定与 Koa 生态基础的团队。新项目应与 Nest、Fastify、Hono 等候选一起，从组织规范、部署运行时、生态与维护成本综合选择。

## 基本使用

Egg 通过约定目录加载 Controller 与 Service。以下展示典型文件职责：

```ts
// app/controller/user.ts
import { Controller } from 'egg'

export default class UserController extends Controller {
  async show() {
    const { ctx, service } = this
    const user = await service.user.find(ctx.params.id)
    ctx.body = { data: user }
  }
}
```

```ts
// app/service/user.ts
import { Service } from 'egg'

export default class UserService extends Service {
  async find(id: string) {
    return this.ctx.model.User.findByPk(id)
  }
}
```

配合路由、配置和模型插件后即可形成标准服务。具体初始化方式、TypeScript 支持与生态插件应遵循项目锁定版本的 Egg 文档。

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 目录、生命周期、配置和插件约定成熟 | 约定与 Loader 机制需要学习，灵活重构成本较高 |
| Service/Controller 分层适合企业项目协作 | 对边缘运行时和极简服务并不轻量 |
| 基于 Koa，可使用部分 Koa 生态 | 新项目需额外评估维护节奏与团队长期技术策略 |

## 注意事项

- `ctx` 是请求级对象，不能保存到全局单例或异步任务中长期复用。
- Controller 只做请求编排；事务、领域规则、调用链与数据访问应下沉到 Service/Repository。
- 插件、配置和应用/Agent 生命周期存在加载顺序，升级或自定义扩展时要覆盖启动与集成测试。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/1. 框架对比|上一篇]] · [[前端/Node/框架/Express|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
