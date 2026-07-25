# Knex

> 官方文档：[Knex.js](https://knexjs.org/guide/)。Knex 是 SQL Query Builder、Schema Builder 和迁移工具，不是完整 ORM。

## 初始化

```ts
const knex = Knex({ client: 'pg', connection: process.env.DATABASE_URL, pool: { min: 0, max: 10 }, acquireConnectionTimeout: 10_000 })
```

```ts
const user = await knex('users').where({ email }).first()
await knex.transaction(async trx => { await trx('users').insert(data); await trx('audit').insert(log) })
```

## 核心功能

- Query Builder：select/insert/update/delete、join、CTE、union、聚合、窗口与子查询；
- Transaction、savepoint 和连接绑定；
- Schema Builder 管理 table、column、index、constraint；
- Raw、Ref 和 identifier/value bindings；
- Migration、Seed 和 CLI；
- 多 SQL dialect、连接池、afterCreate、日志和 asyncStackTraces；
- `wrapIdentifier/postProcessResponse` 适配命名；
- TypeScript 泛型提供基础推导，但动态查询需谨慎。

```ts
const rows = await knex('users as u').leftJoin('posts as p', 'p.author_id', 'u.id')
  .select('u.id').count({ postCount: 'p.id' }).groupBy('u.id').limit(20)
```

## 优劣势

优点：接近 SQL、灵活、成熟、迁移能力实用。缺点：关系映射、实体生命周期、类型推导和领域抽象需自行实现；动态查询类型安全有限。

## 注意事项

所有输入使用参数绑定/构建器；事务内传递 trx；配置池和销毁连接；迁移只向前且可审查；复杂查询使用数据库执行计划。

官方明确不建议浏览器构建 SQL 再交服务端执行；Raw 使用 `?`/`??` bindings；CLI 进程与应用退出时正确 destroy；Schema Builder 不能替代零停机迁移设计。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/Drizzle|上一篇]] · [[前端/Node/ORM/MikroORM|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
