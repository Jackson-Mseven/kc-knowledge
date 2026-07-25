# Rollup

> 官方文档：[Rollup](https://rollupjs.org/introduction/)。Rollup 是 JavaScript 模块打包器，以 ES Modules 为核心，通过静态分析生成适合库或应用发布的输出。

## 核心定位

- Rollup 从入口模块分析 `import`/`export` 依赖关系，打包为 ESM、CJS、IIFE、UMD 等输出格式。
- 它的核心优势是基于 ESM 静态结构的 **Tree Shaking**：未被使用的导出可不进入产物，而不是在完整打包后仅依赖压缩器猜测删除。
- 可使用 CLI（可选配置文件）或 JavaScript API；生态能力通过 plugin 扩展。
- CommonJS 模块通常需要 `@rollup/plugin-commonjs` 处理；Node 内建模块、第三方依赖是否打进产物需由 `external` 明确决定。

```js
// rollup.config.mjs
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  external: ['react'],
  output: [
    { file: 'dist/index.js', format: 'esm', sourcemap: true },
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
  ],
  plugins: [typescript()],
}
```

## 关键配置

| 配置 | 含义 |
| --- | --- |
| `input` | 一个或多个入口模块 |
| `output.format` | 输出格式，如 `es`、`cjs`、`iife`、`umd`、`system` |
| `output.file` / `output.dir` | 单文件输出或多 chunk 输出目录 |
| `external` | 标记不打包、在运行时由使用方提供的依赖 |
| `plugins` | 模块解析、CommonJS 兼容、TypeScript、压缩等扩展 |
| `treeshake` | 控制副作用分析与未使用代码移除策略 |

多入口或动态 `import()` 通常需要使用 `output.dir`，让 Rollup 输出多个 chunk。发布库时要同时协调 Rollup 输出、`package.json` 的 `exports`/`main`/`module` 字段以及声明文件生成。

## Tree Shaking 与副作用

- Tree Shaking 最依赖明确的 ESM 导入导出；动态属性访问、运行时 `require` 和不透明副作用会降低可分析性。
- 有副作用的模块（如自动注册、全局样式、polyfill）不能随意标为可删除，否则功能会丢失。
- `external` 并不是“性能优化开关”：库将 `react` 等 peer dependency 外置可避免重复打包；应用是否外置则取决于运行环境是否确实提供该依赖。

## 适用场景与常见问题

- Rollup 常用于 npm 库、组件库和 SDK，尤其适合需要干净 ESM 产物、多格式发行和有效 Tree Shaking 的场景。
- 应用构建同样可用，但完整开发服务器、复杂资源处理和框架集成通常由 Vite 等上层工具提供。

### Rollup 与 Webpack 的典型区别？

Rollup 更强调以 ESM 静态分析产出精简代码，常用于库；Webpack 强调通用应用打包与丰富资源管线。实际选择取决于项目的开发服务器、插件、资源处理与发布需求，而不是单一性能指标。

### `external` 应如何设置？

只有确认依赖会由消费者或运行环境提供时才外置。库一般外置 `peerDependencies`，并在包元数据中声明；将实际运行时必需而使用方无法提供的依赖外置，会导致模块解析失败。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/构建器/00. 目录|构建器目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/构建器/Esbulid|上一篇]] · [[前端/工程化/构建器/tsup|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
