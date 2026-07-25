# Webpack

> 官方文档：[webpack](https://webpack.js.org/concepts/)。Webpack 是现代 JavaScript 应用的**静态模块打包器**：从一个或多个入口出发构建依赖图，并输出一个或多个可部署的静态资源 bundle。

## 核心概念

| 概念 | 作用 |
| --- | --- |
| `entry` | 依赖图的起点；默认通常为 `./src/index.js`，可配置多入口 |
| `output` | 定义产物目录、文件名和资源公开路径 |
| `module.rules` | 通过 loader 将非 JS/JSON 资源转换为可被依赖图处理的模块 |
| `plugins` | 在编译生命周期中扩展能力，如生成 HTML、注入变量、压缩和资源管理 |
| `mode` | `development`、`production`、`none` 三种内置优化模式 |

Webpack 本身原生理解 JavaScript 与 JSON。CSS、图片、TypeScript 等资源通常由对应 loader 或 Asset Modules 进入构建流程；loader 主要解决“如何转换某类模块”，plugin 负责更广泛的编译与产物能力。

```js
// webpack.config.js
import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    path: path.resolve('dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
}
```

## 构建流程与常见能力

1. 从 `entry` 解析 `import`、`require` 等依赖，建立模块依赖图。
2. 按 `module.rules` 调用 loader 转换模块；loader 一般从右向左/从下向上执行，应避免不必要的转换范围。
3. plugin 在各生命周期钩子中介入编译、优化和资源生成。
4. 根据 `output`、优化与拆包配置生成 chunk、资源清单和最终文件。

- **代码分割**：多入口、`import()` 动态导入与 `optimization.splitChunks` 都可形成独立 chunk，按需加载可降低首屏资源量。
- **Tree Shaking**：依赖 ESM 静态结构和生产优化来移除未使用代码；副作用配置（如 `package.json` 的 `sideEffects`）必须准确。
- **开发体验**：Webpack Dev Server 可提供本地服务与 HMR。HMR 仅替换已更新模块，应用代码仍需具备可接受更新的边界。
- **缓存**：生产文件名使用 `[contenthash]`，配合长缓存；运行时代码与第三方依赖稳定拆分，有助于降低无关变更造成的缓存失效。
- **Source Map**：开发阶段通常选择利于调试的映射，生产阶段按错误追踪与源码暴露策略选择，不应无差别公开源码映射。

## 使用边界

- Webpack 配置灵活、loader/plugin 生态成熟，适合遗留工程、复杂资源管线和高度定制的应用构建。
- 配置不是越多越好：先使用框架默认配置，只有存在明确需求时再扩展规则或 plugin。
- 构建器负责转换与打包，不替代 TypeScript 类型检查；应独立运行 `tsc --noEmit` 或等价流程。
- 若使用 `import()` 等能力支持旧浏览器，除语法转换外仍可能需要按目标环境提供 Promise 等运行时 polyfill。

## 常见问题

### Loader 和 Plugin 有什么区别？

Loader 将特定类型的源文件转换为模块，例如处理 TypeScript、CSS；Plugin 通过编译生命周期处理更广的任务，例如 HTML 生成、环境变量注入、产物优化和资源管理。两者经常配合，但职责不同。

### 为什么 `contenthash` 适合生产缓存？

它由输出内容决定，内容不变时 URL 稳定，内容变更时文件名变化。浏览器可长期缓存旧版本资源，同时新版本通过新 URL 获取；应结合合理的 chunk 策略避免无关改动频繁改变公共产物。

### Tree Shaking 为什么有时不生效？

常见原因包括输出不是可静态分析的 ESM、模块声明了或实际存在副作用、代码通过动态方式访问导出、开发模式未启用对应优化。不能仅凭压缩后体积判断，应检查产物和副作用声明。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/构建器/00. 目录|构建器目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/构建器/Vite|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
