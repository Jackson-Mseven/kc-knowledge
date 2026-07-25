# Umi

> 依据 [Umi 4.6 官方文档](https://umijs.org/docs/guides/getting-started) 和 [Umi Max](https://umijs.org/docs/max/introduce) 整理。Umi 是可扩展的企业级前端框架，围绕路由、构建、插件、约定和工程工具提供一体化方案；Umi Max 在其上集成布局、权限、请求、国际化和微前端等企业能力。

## 1. 创建与运行

官方当前要求 Node 22 或以上：

```bash
pnpm dlx create-umi@latest
pnpm dev
pnpm build
```

默认构建产物在 `dist`。`umi setup` 生成临时类型和运行时文件，依赖变更或配置变化后可能需要重新执行。

## 2. 配置与目录

配置可放 `.umirc.ts` 或 `config/config.ts`：

```ts
export default defineConfig({
  routes: [{ path: '/', component: '@/pages/index' }],
  proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  npmClient: 'pnpm',
})
```

常见目录包括 `src/pages`、`src/layouts`、`src/components`、`src/app.ts`、`mock`。约定式路由和配置式路由应按团队选择，复杂权限/布局项目通常使用显式路由配置更易审查。

## 3. 路由

- 文件/配置路由、动态参数、嵌套路由和 Layout；
- 页面组件按路由拆包；
- 路由数据加载 clientLoader/clientLoader.hydrate 等能力按官方当前 API 使用；
- history、base、publicPath 必须与部署子路径一致；
- MPA 模式用于多入口页面，不能与 SPA 心智直接混用。

## 4. 插件体系

Umi 核心通过插件扩展：配置、命令、生成文件、运行时和 Bundler 能力都可由插件提供。项目优先使用官方/稳定插件；自定义插件应定义 API、版本兼容和测试，避免把业务逻辑隐藏在构建钩子。

## 5. Mock、Proxy 与环境变量

- 本地 Mock 适合前后端并行开发，生产必须连接真实 API；
- Proxy 只在开发服务器生效，生产跨域由网关/服务配置；
- 环境变量区分构建期公开值和服务端 Secret；浏览器包中的值都可被用户读取；
- 多环境差异保持少量配置，避免分别构建出不可追踪的代码版本。

## 6. Umi Max

Umi Max 是面向中后台的最佳实践集合，当前官方导航包含：

- Layout 与 Menu、Ant Design、图表；
- 数据流、Request、Access 权限；
- i18n、微前端；
- React Query、Valtio、Dva 等状态方案；
- Analytics、Tailwind CSS 等插件能力。

只启用实际使用的插件，避免重复状态库和请求层。Access 控制页面展示不等于后端权限，API 必须再次鉴权。

## 7. 数据请求与状态

Request 插件可统一错误、拦截器和请求配置；业务仍需定义 API schema、取消、超时、重试和错误码。服务端状态优先 React Query 等专用缓存，客户端全局状态按复杂度选择 model/Valtio/Dva，不应并存多套无边界数据源。

## 8. 微前端

Umi Max 微前端能力适合已有 Umi 企业体系。需要明确基座/子应用路由、运行时依赖、通信、权限、独立部署和错误降级；不能仅开启插件就解决组织边界。

## 9. 工程能力

- TypeScript、Lint、测试、微生成器和调试指南；
- CSS/Less、CSS Modules 与可选样式方案；
- MFSU/构建加速能力以及当前 Rust Bundler 选项需按版本评估；
- Generator 用于统一页面、组件和配置样板；
- 插件和临时目录升级后出现异常时先重新 setup、清缓存并检查迁移指南。

## 10. 部署与注意事项

- SPA 服务器配置 history fallback，但静态资源和 API 404 不应都返回 HTML；
- 配置 `base/publicPath` 适配子路径/CDN；
- 哈希资源长期缓存，HTML 短缓存；
- Source Map、版本、错误监控和 CI artifact 关联；
- Umi/Max 插件版本集中升级并运行关键 E2E；
- Umi 偏企业 React 应用，内容站/极简组件库不一定需要完整框架能力。

## 11. 优劣势

优势：国内企业生态、约定和插件完整，中后台从布局到权限快速落地；工程配置统一。代价：框架和插件抽象较多，升级兼容需治理；定制偏离默认路径时理解成本增加；国际化通用生态与部署场景需单独评估。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/框架/Umi/00. 目录|Umi目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
