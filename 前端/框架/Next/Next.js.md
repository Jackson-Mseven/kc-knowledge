# Next.js

> 依据 [Next.js App Router 官方文档](https://nextjs.org/docs/app) 整理。查阅时官网最新版本为 16.2.11。Next.js 是 React 全栈框架，App Router 提供文件路由、React Server Components、Streaming、数据读写、缓存、Route Handler、资源优化和多种部署模式。

## 1. 创建项目与目录

```bash
pnpm create next-app@latest
pnpm dev
pnpm build
pnpm start
```

```text
app/
├── layout.tsx        # 根布局，必须包含 html/body
├── page.tsx          # / 页面
├── loading.tsx       # Suspense 加载边界
├── error.tsx         # 客户端错误边界
├── not-found.tsx     # 404 UI
├── products/
│   └── [id]/page.tsx # 动态路由
└── api/users/route.ts
```

文件夹定义 URL segment，`page` 让 segment 可访问，`layout` 跨导航保留 UI。Route Group `(group)` 不进入 URL；Parallel Route 使用 `@slot`；Intercepting Route 用于 Modal 等保留上下文的导航。

## 2. Server 与 Client Components

App Router 组件默认是 Server Component：可以在服务端读取数据库和秘密、减少客户端 JavaScript，并流式传输结果。需要 state、事件、Effect 或浏览器 API 时，在模块顶部写 `'use client'`。

```tsx
// Server Component
export default async function Page() {
  const products = await db.product.findMany()
  return <ProductList products={products} />
}
```

```tsx
'use client'
export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

- `'use client'` 建立客户端模块边界，其传递下去的导入会进入客户端图；边界应尽量小；
- Server Component 可以渲染 Client Component；Client Component 不能直接 import Server Component，但可通过 children/props 接收服务端已构造的节点；
- 传给 Client Component 的 Props 必须可序列化；
- 不要把数据库 Client、Secret 或仅服务端模块导入客户端边界。

## 3. 数据读取与 Streaming

Server Component 可直接 `await` 数据库或 `fetch`。独立请求用 `Promise.all` 并行，存在依赖时串行。通过 `<Suspense>` 和 `loading.tsx` 流式输出慢区块：

```tsx
export default function Page() {
  return <Suspense fallback={<OrdersSkeleton />}><Orders /></Suspense>
}
```

Streaming 能更早发送静态壳，但边界过多会产生闪烁和布局变化。为 fallback 预留稳定尺寸，错误边界靠近可能失败的数据域。

## 4. 缓存与重新验证

Next.js 当前缓存模型随版本演进较快，应以项目锁定版本文档为准。App Router 需要分别理解请求 memoization、数据缓存、路由/输出缓存和客户端 Router Cache，而不是笼统认为“fetch 自动缓存”。

- 对应数据使用明确缓存 API/配置；
- 时间重新验证适合允许固定陈旧窗口的数据；
- `revalidatePath` 按路径使相关内容失效；
- `revalidateTag`/缓存 tag 适合同一数据影响多个页面；
- Cache Components 和 `'use cache'` 是当前官方缓存方向之一，迁移旧缓存模型应遵循对应指南；
- 用户身份、Cookie 和个性化数据不能误放入共享缓存。

缓存失效应发生在成功写入之后。不要在每次请求中无条件失效，也不要把权限结果跨用户缓存。

## 5. 数据变更与 Server Actions

```ts
'use server'
export async function createTodo(formData: FormData) {
  const input = schema.parse({ title: formData.get('title') })
  const user = await requireUser()
  await db.todo.create({ data: { ...input, userId: user.id } })
  revalidatePath('/todos')
}
```

```tsx
<form action={createTodo}>
  <input name="title" />
  <button type="submit">添加</button>
</form>
```

Server Action 是可从组件/表单调用的服务端入口，不是可信内部函数。必须校验输入、认证、授权、CSRF/Origin、幂等和错误；不要把仅靠页面隐藏的能力视为安全边界。

## 6. Route Handlers

`app/**/route.ts` 使用 Web Request/Response API 实现 HTTP Endpoint：

```ts
export async function GET(request: Request) {
  return Response.json({ data: await listUsers() })
}
```

适合 Webhook、公开 API、BFF 和非页面客户端。不能与同一 segment 的 `page.tsx` 冲突。大规模独立后端、长任务和复杂队列不必强行放入 Next。

## 7. 导航、错误与状态

- `<Link>` 提供客户端导航和预取；
- `useRouter` 只在 Client Component 使用，不要用它替代正常 Link；
- `redirect`/`permanentRedirect` 用于服务端导航，`notFound` 触发最近 404；
- `error.tsx` 必须是 Client Component，不能捕获同 segment layout 中的所有错误；
- `global-error.tsx` 处理根级错误；
- URL search params 适合可分享筛选状态，局部交互保留在组件 state。

## 8. Metadata、图片与字体

- 导出静态 `metadata` 或 `generateMetadata` 生成 title、description、canonical、Open Graph；
- `next/image` 提供尺寸、响应式和格式优化，但远程源与 CDN loader 需配置；
- `next/font` 自托管并减少外部字体请求；
- 动态 OG Image、Sitemap、robots、manifest 有对应文件约定；
- Metadata 获取数据时避免重复慢请求和错误缓存。

## 9. Proxy、Middleware 与运行时

当前文档使用 Proxy 能力处理请求前重写、重定向和部分认证前置。它不适合数据库重查询和完整业务处理。Node.js 与 Edge/平台运行时支持的 API、原生依赖和连接方式不同，选择前检查目标部署平台。

## 10. 部署与生产注意事项

- 可部署到 Node Server、Docker、支持 Next 的平台或静态导出（功能受限）；
- 多实例时缓存、ISR 产物、文件系统和 tag 失效需要共享/平台协调；
- Build Once，环境变量区分服务端与 `NEXT_PUBLIC_` 客户端公开变量；
- 自定义 Server 会放弃部分框架优化，只有明确需求才使用；
- 监控 Server Component/Action/Route Handler、缓存命中、Web Vitals 和 hydration error；
- 升级前阅读版本迁移指南和 codemod，缓存、Proxy、Turbopack 等行为可能变化。

## 11. 常见问题

### Server Component 是否等同于 SSR？

不是。SSR 描述把组件渲染为初始 HTML；Server Component 描述组件代码只在服务端执行并以 RSC Payload 参与 UI，可在构建或请求阶段运行。两者可以组合。

### Next.js 是否可以当完整后端？

可以承担 BFF、表单 Action、Webhook 和中小型 API，但复杂领域服务、独立扩容、长任务和多消费者 API 通常更适合独立后端。按部署和组织边界选择。

### 为什么缓存容易出错？

因为数据、页面输出、浏览器 Router 和 CDN 可能分别缓存，且动态 API、身份和版本会改变缓存条件。必须明确缓存对象、key、生命周期和失效事件。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/框架/Next/00. 目录|Next目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
