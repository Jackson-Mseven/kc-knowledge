# Nest

Nest 是面向 Node.js 的模块化框架，默认常运行在 Express 上，也可切换 Fastify 适配器。它使用 TypeScript、装饰器与依赖注入组织大型后端应用，借鉴 Angular 的模块化设计。

## 核心结构

| 概念 | 职责 |
| --- | --- |
| Module | 组织 provider、controller 和依赖边界 |
| Controller | 定义路由并处理协议层请求/响应 |
| Provider / Service | 承载业务逻辑、数据访问或基础设施能力，可被注入 |
| Guard | 在路由执行前处理认证、授权 |
| Pipe | 参数转换与校验 |
| Interceptor | 包装执行过程，用于日志、缓存、响应映射等 |
| Filter | 捕获并格式化异常 |

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }
}
```

## 实践要点

- 模块边界应按业务领域划分，避免所有 provider 都放进根模块或跨模块随意导出。
- DTO、校验管道和 OpenAPI 文档能统一 API 契约；TypeScript 类型不会在运行时自动校验，需要 class-validator、Zod 等运行时机制。
- Guard 适合认证/授权，Interceptor 适合横切包装，Exception Filter 统一错误输出；不要将所有逻辑塞进全局中间件。
- Nest 抽象层较多，应保持 Controller 薄、Service 可测试、基础设施可替换，避免装饰器掩盖数据流和性能热点。

## 选型

适合大型 TypeScript 团队、领域模块清晰、需要依赖注入、统一约定、REST/GraphQL/WebSocket/微服务扩展能力的场景。小型服务若只需少量路由，Express、Hono 或 Fastify 可能更直接。

## 基本使用

```bash
npm i -g @nestjs/cli
nest new api
```

```ts
// users.module.ts
@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(3000)
}
bootstrap()
```

`ValidationPipe` 依赖运行时 DTO 元数据与校验器配置。若采用 Zod 等 schema，应统一适配方式，不能误以为 TypeScript 接口会自动校验请求体。

## 核心优劣势

| 优势 | 劣势 |
| --- | --- |
| 模块、DI、Guard/Pipe/Interceptor/Filter 形成清晰分工 | 抽象层和装饰器较多，小服务初始样板偏重 |
| TypeScript 优先，适合多人协作和大型领域 | 错误理解生命周期与 provider 作用域时排查成本较高 |
| 可切换 Express/Fastify，生态覆盖 REST/GraphQL/WS/微服务 | 强约定不代表自动获得良好领域设计或性能 |

## 注意事项

- Provider 默认单例；请求作用域会增加创建和依赖解析成本，仅在真正需要请求上下文时使用。
- DTO、Entity、领域模型不要强行共用一个类，分别服务于协议校验、持久化和业务约束更清晰。
- 全局 Guard/Pipe/Filter/Interceptor 很方便，但要控制职责和顺序，避免隐式行为难以追踪。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/框架/00. 目录|框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/框架/Koa|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
