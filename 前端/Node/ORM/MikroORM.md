# MikroORM

> 官方文档：[MikroORM v7](https://mikro-orm.io/docs/quick-start)。MikroORM 是 Data Mapper ORM，核心是 Unit of Work、Identity Map、EntityManager 和关系集合。

## 初始化

```ts
const orm = await MikroORM.init({ entities: [User, Post], dbName: 'app', driver: PostgreSqlDriver })
const em = orm.em.fork()
```

```ts
@Entity() class User { @PrimaryKey() id!: number; @Property({ unique: true }) email!: string }
const user = await em.findOne(User, { email }, { populate: ['posts'] })
await em.transactional(async em => { em.create(User, data); await em.flush() })
```

## 核心功能

- Decorator/EntitySchema 建模、Embeddable、继承和自定义类型；
- Identity Map 保证同一工作单元内实体身份；Unit of Work 计算变更并在 flush 持久化；
- Reference/Collection、lazy/eager loading、populate、loading strategy；
- QueryBuilder、EntityRepository、过滤器和原生 SQL；
- transaction/transactional、锁与并发控制；
- Schema Generator、Migration、Seeder；
- Serialization、Event Subscriber、Hook、软删除配方；
- NestJS 等集成以及 SQL/MongoDB driver。

```ts
const books = await em.find(Book, { author: { name: { $like: 'Ada%' } } }, { populate: ['author'], limit: 20 })
```

## 优劣势

优点：Unit of Work/Identity Map 完整、关系和领域实体能力强、TypeScript 友好。缺点：心智模型与学习成本较高；EntityManager 请求作用域必须正确；隐式 flush/populate 需理解。

## 注意事项

每请求 fork EntityManager；明确 populate 避免 N+1；生产 migration；理解 flush 时机、级联和 orphan removal；批处理关注 Unit of Work 内存。

不要跨请求共享 Identity Map；批量任务分批 flush/clear；序列化实体前明确已加载关系；`persist` 进入工作单元但通常需 `flush` 才写库；事务回调使用其 EntityManager。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/Knex|上一篇]] · [[前端/Node/ORM/Mongoose|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
