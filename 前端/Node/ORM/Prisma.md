# Prisma

> 官方文档：[Prisma ORM](https://www.prisma.io/docs/orm)。Prisma 由 Prisma Schema、Migrate、生成的类型安全 Client、Studio 与数据工作流工具组成，适合 TypeScript API 和关系数据库。

## 安装与初始化

```bash
pnpm add @prisma/client
pnpm add -D prisma
pnpm prisma init
pnpm prisma generate
```

`prisma init` 创建 Schema 与连接配置；修改 Schema 后重新 generate。生成类型不等于数据库已迁移。

```prisma
model User { id Int @id @default(autoincrement()) email String @unique posts Post[] }
model Post { id Int @id @default(autoincrement()) title String author User @relation(fields:[authorId], references:[id]) authorId Int }
```

```ts
const user = await prisma.user.findUnique({ where: { email }, include: { posts: true } })
await prisma.$transaction(async tx => { await tx.user.create({ data }); await tx.audit.create({ data: log }) })
```

## 核心功能

- Schema 声明 Model、字段、枚举、关系、索引、唯一约束、映射与数据库原生类型；
- Client 提供 `findUnique/findMany/create/update/upsert/delete/count/aggregate/groupBy`；
- `select` 精确字段，`include` 加载关系，嵌套 write 可在一次操作创建/连接关系；
- 过滤、排序、游标/偏移分页、批量操作；
- `$transaction([queries])` 批量事务和交互式事务；
- `$queryRaw`/`$executeRaw` 处理 Client API 难以表达的 SQL；
- Migrate 支持开发迁移、生产部署、迁移历史和已有库 introspection；
- Studio 用于本地查看与编辑数据。

## CRUD 与分页

```ts
const created = await prisma.user.create({ data: { email, posts: { create: { title } } } })
const page = await prisma.post.findMany({
  where: { published: true }, orderBy: { id: 'desc' }, take: 20,
  cursor: cursor ? { id: cursor } : undefined, skip: cursor ? 1 : 0,
  select: { id: true, title: true, author: { select: { name: true } } },
})
```

## 优劣势

优点：Client 类型推导强、Schema 清晰、迁移与 Studio 完整、上手快。缺点：生成步骤和独特查询 API；复杂 SQL/数据库特性可能需 Raw SQL；Serverless 需治理连接。

## 注意事项

生产迁移使用 `migrate deploy`，不在应用启动时运行开发迁移；单例复用 Client；分页避免无界 include；Raw SQL 参数化；评估连接池/数据代理和 N+1。

- `migrate dev` 只用于开发，生产迁移文件必须审查锁表、回填与回滚方案；
- `relationLoadStrategy`、批量查询与 dataloader 行为按当前版本和数据库验证；
- Serverless/Edge 根据官方支持选择 driver adapter/连接池方案，不能每次请求无限创建连接；
- 使用 `$queryRaw` 的 tagged template，避免 `Unsafe` API 拼接用户输入。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/Mongoose|上一篇]] · [[前端/Node/ORM/Sequelize|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
