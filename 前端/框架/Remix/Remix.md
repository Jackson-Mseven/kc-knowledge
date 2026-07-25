# Remix 与 React Router Framework Mode

> 依据 [Remix v2 官方文档](https://v2.remix.run/docs/) 与 [React Router Framework Mode](https://reactrouter.com/start/framework/installation) 整理。Remix 官网已明确：最新 Remix 框架能力已进入 React Router。新项目应优先阅读 React Router Framework Mode；既有 Remix v2 项目继续参考 v2 文档和官方升级路径。

## 1. 核心理念

- 使用嵌套路由同时组织 URL、数据、错误和 UI；
- Loader 在渲染前读取数据，Action 处理写入；
- `<Form>` 基于浏览器 HTML Form 和 HTTP 语义，JavaScript 加载前也可工作；
- 导航和表单提交后自动重新验证相关 Loader；
- Pending UI、错误边界、滚动恢复和代码分割以路由为单位；
- 强调 Progressive Enhancement 和 Web Standards。

## 2. Framework Mode 与三种模式

React Router 当前提供：

- Framework Mode：Vite 插件、类型安全 route module、代码分割、SSR/预渲染和框架约定；
- Data Mode：自行控制 Bundler，使用 Data Router 的 loader/action/fetcher；
- Declarative Mode：传统 `<BrowserRouter><Routes>` 组件路由。

Remix 心智模型最接近 Framework Mode。不要把旧 Remix package API 和当前 React Router 文档不加区分地混用。

## 3. 路由与 Route Module

Route Module 可导出 Component、loader、action、ErrorBoundary、headers、links、meta、shouldRevalidate 等。父路由通过 `<Outlet>` 渲染子路由。

```ts
export async function loader({ params }: Route.LoaderArgs) {
  const product = await db.product.findUnique({ where: { id: params.id } })
  if (!product) throw new Response('Not Found', { status: 404 })
  return { product }
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.product.name}</h1>
}
```

路由配置、文件约定和生成类型随当前 Framework Mode 版本为准；将 `.server` 代码与客户端模块清晰隔离。

## 4. Loader 与数据并行

匹配的嵌套路由 Loader 通常可以并行加载，减少组件挂载后瀑布请求。Loader 返回值可序列化给客户端，不能泄露数据库凭证、内部 Token 和多余用户字段。

- 在 Loader 中认证并进行资源级授权；
- 使用 Request signal 取消下游请求；
- 抛出/返回 Response 表达 HTTP 状态；
- HTTP Cache-Control 通过 route `headers` 或响应头控制；
- 慢数据可结合流式/defer 能力，具体 API 按所用版本核对。

## 5. Action、Form 与 Revalidation

```tsx
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const input = schema.parse(Object.fromEntries(formData))
  await updateProfile(input)
  return redirect('/profile')
}

export default function Page() {
  return <Form method="post"><input name="name" /><button>保存</button></Form>
}
```

Action 成功后 Router 会重新验证页面数据。必须处理校验、认证、授权、CSRF、幂等和重复提交。使用 `useNavigation` 展示全局导航状态，`useFetcher` 执行不触发导航的读取/写入。

## 6. Pending、Optimistic 与错误

- `useNavigation` 判断当前 navigation/form submission；
- `useFetcher` 有独立 state/data/formData，适合收藏、联想和局部表单；
- 可基于提交的 formData 显示乐观结果，但服务端仍是最终事实；
- Route ErrorBoundary 捕获 Loader、Action 和渲染错误；
- 404/401/403 用真实 Response 状态，保留可恢复 UI。

## 7. Sessions 与 Cookie

框架提供 Cookie/Session Storage 工具。Session 通常在 Loader/Action 中读取和提交：

- Cookie 设置 HttpOnly、Secure、SameSite 和有效期；
- Cookie Session 容量有限，不能保存大量数据；
- 数据库存储 Session 需处理撤销、过期和并发；
- Flash message 读取后删除，嵌套路由并发读取时避免竞态。

## 8. 渲染与部署

Framework Mode 支持 SPA、SSR 和预渲染等策略，部署由 adapter/runtime 决定。Node、Cloudflare 等环境 API 和连接模型不同。`entry.client`/`entry.server` 用于定制 hydration 和服务器入口，但普通项目优先保留默认。

## 9. Remix v2 迁移注意事项

- 先升级到兼容的 Remix v2 future flags，再迁移 React Router；
- 核对 package、Vite plugin、route conventions、类型生成和 adapter；
- Loader/Action/Form/useFetcher 等核心概念可延续；
- 不在同一变更中同时重写路由、数据层和部署平台；
- 用关键 E2E 验证导航、提交、Session、错误状态和 JS 禁用下的基本表单。

## 10. 优劣势

优势：Web 标准心智、嵌套路由数据并行、渐进增强、错误与 pending 内建、表单流程自然。代价：读写以路由为中心，需要适应重新验证；部署/runtime 和版本迁移需管理；高度客户端化应用可能更习惯传统 SPA 状态层。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/框架/Remix/00. 目录|Remix目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
