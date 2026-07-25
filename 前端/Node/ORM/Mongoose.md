# Mongoose（ODM）

> 官方文档：[Mongoose v9](https://mongoosejs.com/docs/guide.html)。Mongoose 面向 MongoDB，是 ODM 而非 SQL ORM，提供 Schema、Model、Document、Query、Validation 和 Middleware。

## 初始化

```ts
await mongoose.connect(process.env.MONGODB_URI!, { maxPoolSize: 10, serverSelectionTimeoutMS: 5_000 })
```

```ts
const User = model('User', new Schema({ email: { type: String, required: true, unique: true } }))
const user = await User.findOne({ email }).lean()
```

## 核心功能

- SchemaType、default、validator、getter/setter、alias、virtual、method、static、query helper；
- Model CRUD、Document change tracking、Query chaining 与 Aggregation；
- Subdocument、Array、Map、Mixed；
- Middleware：document/query/model/aggregate hooks；
- populate、virtual populate、refPath；
- discriminator 实现同集合继承；
- index、timestamp、optimisticConcurrency、plugin；
- session/transaction、change stream、TypeScript 支持。

```ts
const users = await User.find({ active: true }).select('email profile').sort({ _id: -1 }).limit(20).lean()
const stats = await Order.aggregate([{ $match: { paid: true } }, { $group: { _id: '$userId', total: { $sum: '$amount' } } }])
```

## 优劣势

优点：MongoDB 生态成熟、Schema 与 middleware 丰富、资料多。缺点：Schema/TypeScript 可能重复；populate 易产生额外查询；文档模型不能照搬关系型设计。

## 注意事项

`unique` 主要创建索引而非业务校验；读多写少返回普通对象可用 `lean()`；设置索引、超时和连接池；事务需要 replica set；避免无界数组和过深嵌套。

生产可关闭自动建索引并独立部署索引；更新操作的 validator 行为与 document save 不同；Mixed 修改可能需 `markModified`；populate 不是数据库 join，关注额外查询和数据建模；MongoDB 设计应在嵌入与引用间按访问模式选择。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/Node/ORM/00. 目录|ORM目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/Node/ORM/MikroORM|上一篇]] · [[前端/Node/ORM/Prisma|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
