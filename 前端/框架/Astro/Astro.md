# Astro

> 依据 [Astro v7 官方文档](https://docs.astro.build/en/getting-started/) 整理。Astro 面向内容驱动网站，默认把大部分页面生成 HTML，只在需要交互的位置加载客户端 JavaScript，核心是 Islands Architecture。

## 1. 创建项目

```bash
pnpm create astro@latest
pnpm dev
pnpm build
pnpm preview
```

```text
src/
├── pages/       # 文件路由和 Endpoint
├── components/  # Astro/框架组件
├── layouts/
├── content.config.ts
└── middleware.ts
public/          # 原样复制资源
```

`.astro` 组件由 frontmatter 脚本和 template 组成。组件脚本默认在服务端/构建时执行，不会自动发送给浏览器。

```astro
---
const posts = await getPosts()
---
<ul>{posts.map(post => <li><a href={`/posts/${post.slug}`}>{post.title}</a></li>)}</ul>
```

## 2. Islands Architecture

页面主体为静态 HTML，需要交互的 React/Vue/Svelte 等组件通过 client directive 单独 hydrate：

```astro
<SearchBox client:load />
<Comments client:visible />
<Carousel client:idle />
<Menu client:media="(max-width: 768px)" />
```

- `client:load` 立即 hydrate，适合首屏关键交互；
- `client:idle` 浏览器空闲时；
- `client:visible` 进入视口时；
- `client:media` 匹配媒体条件时；
- 没有 client directive 的框架组件只输出 HTML，不发送组件 JS。

Islands 降低整体 JS，但不同岛之间共享客户端状态需要显式方案。不要把整页包成一个 `client:load` SPA，否则失去主要优势。

## 3. Server Islands

Server Islands 把个性化或动态服务端区域从页面其余缓存/静态内容中分离。页面壳可以快速返回，动态岛稍后加载。适合用户头像、购物车摘要等局部动态内容，但需处理 fallback、布局稳定、认证和额外请求。

## 4. 路由与页面

- `src/pages/about.astro` 对应 `/about`；
- `[slug].astro` 动态路由；静态构建使用 `getStaticPaths` 枚举路径；
- Rest parameter 支持多段路由；
- Endpoint 导出 GET/POST 等方法返回 Response；
- Middleware 可修改 request locals、重定向和响应；
- i18n、prefetch 和 View Transitions 有官方支持。

## 5. Content Collections

Content Collections 用 loader/schema 管理 Markdown、MDX 或其他内容来源，并提供类型安全：

```ts
const blog = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/blog' }), schema: z.object({ title: z.string(), published: z.date() }) })
```

适合博客、文档、商品内容和 Headless CMS 数据。Schema 是构建/运行校验边界，内容变更与部署/缓存策略需匹配。

## 6. Rendering Mode 与 Adapter

Astro 默认预渲染静态页面。需要按请求渲染时配置适合平台的 adapter，并对路由选择 on-demand rendering。Adapter 将服务器输出部署到 Node、Cloudflare、Netlify、Vercel 等平台。

- 静态优先能获得简单 CDN 缓存；
- 动态路由可访问 Cookie、Session 和请求数据；
- 不同 adapter 的 runtime、文件系统、环境变量和流式能力不同；
- `prerender` 策略按页面而非整站统一决定。

## 7. Actions 与 Sessions

Astro Actions 提供类型安全的服务端调用和输入校验；Sessions 提供请求间服务器状态。它们仍需认证、授权、CSRF、错误和存储治理，不能因为框架生成类型而跳过安全校验。

## 8. 样式、图片与脚本

- `.astro` style 默认 scoped，可使用全局样式和 CSS 工具；
- Image 组件/内容图片提供尺寸和优化；
- `public` 资源不经构建优化；
- 普通 `<script>` 会由 Astro 处理/打包，`is:inline` 原样输出；
- 字体、语法高亮和第三方脚本按官方集成配置，避免破坏零/少 JS 目标。

## 9. 适用场景

特别适合博客、文档、营销、媒体、内容电商和以阅读为主的站点。高度交互、全局客户端状态密集的后台应用可嵌 SPA 岛，但若绝大部分页面都需 hydration，React/Next 等框架可能更自然。

## 10. 性能与 SEO

- 默认少 JS 是优势，不代表图片、字体、第三方脚本自动优化；
- 为客户端岛选择最晚仍满足体验的 hydration 时机；
- Metadata、canonical、Sitemap、RSS、结构化数据按内容站治理；
- Server Island fallback 预留尺寸，避免 CLS；
- 监控静态与动态路由的 LCP、INP、TTFB 和 adapter 冷启动。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/框架/Astro/00. 目录|Astro目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
