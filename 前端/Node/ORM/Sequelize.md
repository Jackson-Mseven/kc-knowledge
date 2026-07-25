# Sequelize

> 官方稳定文档：[Sequelize v6](https://sequelize.org/docs/v6/)。Sequelize 使用 Model、Association、Validation、Hook 和 Transaction 管理 SQL 数据。

## 初始化

```ts
const sequelize = new Sequelize(process.env.DATABASE_URL!, { dialect: 'postgres', pool: { max: 10, min: 0, idle: 10_000 }, logging: false })
await sequelize.authenticate()
```

```ts
const User = sequelize.define('User', { email: { type: DataTypes.STRING, unique: true } })
const user = await User.findOne({ where: { email } })
await sequelize.transaction(async transaction => User.create(data, { transaction }))
```

## 核心功能

- Model define/init、实例与静态查询、getter/setter/virtual；
- Validation 与数据库 Constraint；
- `hasOne/belongsTo/hasMany/belongsToMany`、eager loading、scope、through model；
- paranoid 软删除、Hook、Index、乐观锁；
- managed/unmanaged transaction、隔离级别与锁；
- Raw Query、literal/replacements/bind parameters；
- Migration/Seed 通常通过 Sequelize CLI；
- 多 dialect、连接池、读复制和 AWS Lambda 指南。

```ts
const users = await User.findAll({ where: { active: true }, include: [{ model: Post, required: false }], limit: 20, order: [['id', 'DESC']] })
```

## 优劣势

优点：成熟、数据库支持与生态广、关联和事务能力完整。缺点：TypeScript 推导和 Model 声明样板相对较多；include 易产生复杂 SQL；API 历史包袱较重。

## 注意事项

生产使用 migration 而非 `sync({ alter: true })`；配置连接池和超时；关联查询检查 SQL/索引；事务对象显式向下传递；分页避免 include 导致计数和重复行错误。

Model validation 不替代 API schema；`findAndCountAll` 配合多对多 include 需检查 distinct/计数；Hook 不应隐藏关键业务流程；原始 SQL 使用 replacements/bind，避免 literal 拼接。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/Prisma|上一篇]] · [[前端/Node/ORM/TypeORM|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
