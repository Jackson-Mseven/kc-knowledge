# Drizzle ORM

> 官方文档：[Drizzle ORM](https://orm.drizzle.team/docs/overview)。Drizzle 是 TypeScript-first、SQL-like 的 Headless ORM，以 TS Schema、查询构建器和 Drizzle Kit 提供类型安全。

## 安装与连接

```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

```ts
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema })
```

```ts
export const users = pgTable('users', { id: serial('id').primaryKey(), email: text('email').notNull().unique() })
const rows = await db.select().from(users).where(eq(users.email, email))
await db.transaction(async tx => tx.insert(users).values({ email }))
```

## 核心功能

- PostgreSQL、MySQL、SQLite、SingleStore、MSSQL、CockroachDB 及多种 Serverless driver；
- TS Schema 声明列类型、索引、约束、序列、View、Schema、生成列、RLS 与扩展；
- `select/insert/update/delete`、filters、joins、aliases、set operations、聚合和 SQL operator；
- Relations 与 Relational Query API，用于嵌套关系结果；
- 事务、savepoint、batch、prepared statement、动态查询；
- `sql` 模板安全嵌入原生表达式；
- Drizzle Kit 的 `generate/migrate/push/pull/check/studio`；
- Seed、查询性能、Serverless 与 Cache 指南。

```ts
const result = await db.select({ id: users.id, postCount: count(posts.id) })
  .from(users).leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id).limit(20)
```

## 优劣势

优点：SQL 心智模型直接、类型强、运行时轻、适合 Serverless/Edge 驱动。缺点：高级关联与生态成熟度需按版本评估；数据库差异更直接暴露；团队需具备 SQL 能力。

## 注意事项

使用 drizzle-kit 管理并审查迁移；明确 driver 的连接/事务支持；为复杂查询看执行计划；Schema 类型不替代 API 运行时校验。

`push` 更适合快速原型，团队生产流程优先生成并评审迁移；Relations 是应用查询抽象，不等同于数据库外键；`sql.raw` 不应用于用户输入；边缘 driver 对事务、prepared statement 和连接行为可能不同。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/1. ORM对比|上一篇]] · [[前端/Node/ORM/Knex|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
