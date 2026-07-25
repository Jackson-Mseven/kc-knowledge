# TypeORM

> 官方文档：[TypeORM](https://typeorm.io/docs/getting-started)。当前官网为 TypeORM 1.x。它以 Entity、Decorator、Repository/DataSource 建模，同时支持 Active Record 与 Data Mapper。

## 初始化

```ts
const dataSource = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, entities: [User], migrations: ['dist/migrations/*.js'], synchronize: false })
await dataSource.initialize()
```

```ts
@Entity() class User { @PrimaryGeneratedColumn() id: number; @Column({ unique: true }) email: string }
const user = await dataSource.getRepository(User).findOneBy({ email })
await dataSource.transaction(manager => manager.save(User, data))
```

## 核心功能

- Column、Primary/Generated、Embedded Entity、Inheritance、View Entity；
- OneToOne、OneToMany、ManyToOne、ManyToMany 与 RelationId；
- Repository/EntityManager、Find Options、QueryBuilder、Raw SQL；
- eager/lazy relations、relation query builder；
- Transaction、QueryRunner、锁、隔离级别；
- Subscriber、Entity Listener、软删除、Tree Entity、缓存；
- Migration generate/run/revert 与多 DataSource；
- 支持 PostgreSQL、MySQL/MariaDB、SQLite、MSSQL、Oracle、MongoDB 等。

```ts
const users = await repo.createQueryBuilder('u').leftJoinAndSelect('u.posts', 'p')
  .where('u.active = :active', { active: true }).orderBy('u.id', 'DESC').take(20).getMany()
```

## 优劣势

优点：传统 ORM 能力完整、装饰器模型直观、数据库支持广、Nest 集成常见。缺点：复杂关系、懒加载和 Entity 状态可能产生隐式查询；类型与运行时元数据较复杂；迁移管理需纪律。

## 注意事项

生产禁用 `synchronize`；显式生成并审查 migration；避免双向关系和 eager 无界加载；事务内只使用传入 manager；开启查询日志定位 N+1。

Decorator 类型不能保证数据库运行时数据；Lazy Relation 的 Promise 模型可能产生隐式查询；批量更新优先 QueryBuilder 而非逐个 save；升级 0.3 到 1.x 必须按官方迁移指南处理 Breaking Changes。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/Sequelize|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
