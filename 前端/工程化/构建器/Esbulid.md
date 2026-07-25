# esbuild

> 官方文档：[esbuild](https://esbuild.github.io/)。esbuild 是以 Go 实现的高性能 JavaScript/CSS 构建工具，提供打包、转换、压缩、代码分割、Source Map、本地服务、watch 与插件 API。

## 核心能力

- 内建支持 JavaScript、TypeScript、JSX、CSS、JSON 等内容类型，可打包 ESM 与 CommonJS。
- 同时提供 CLI、JavaScript API 与 Go API；常作为 Vite、tsup 等上层工具的底层转换/打包能力。
- 可通过 `bundle`、`format`、`platform`、`target`、`splitting`、`minify`、`sourcemap`、`external` 等选项控制输出。
- 速度是核心目标，但不代表应忽略产物兼容性、插件能力、类型检查和调试体验。

```js
// build.mjs
import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  splitting: true,
  sourcemap: true,
  minify: true,
})
```

## 关键选项

| 选项 | 作用 |
| --- | --- |
| `entryPoints` | 指定入口文件，可使用多个入口 |
| `bundle` | 将依赖打入产物；关闭时仅做转换 |
| `platform` | `browser`、`node` 或 `neutral`，影响内建模块与默认行为 |
| `format` | `esm`、`cjs`、`iife` 等输出模块格式 |
| `target` | 目标运行环境语法版本；不等于完整运行时 polyfill |
| `external` | 保留为运行时导入、不打入 bundle 的模块 |
| `define` | 编译期文本替换/常量定义，适合构建变量但需避免注入敏感值 |
| `loader` | 指定文件类型加载方式，如 `file`、`dataurl`、`text` |
| `metafile` | 输出构建元数据，可用于分析依赖和产物体积 |

## 重要边界

- esbuild 会移除 TypeScript 类型语法，但**不会进行类型检查**；应单独执行 `tsc --noEmit`。
- `target` 主要控制语法降级，Web API 或 Node API 的兼容仍需根据运行环境处理 polyfill。
- 插件包含 `onResolve`、`onLoad`、`onStart`、`onEnd` 等钩子；插件可扩展模块解析和加载，但过多 JS 插件回调可能抵消部分性能优势。
- `serve` 适合本地服务能力；复杂应用开发服务器、框架 HMR 与完整生态集成通常使用 Vite 等工具。

## 常见问题

### esbuild 和 Babel 有何区别？

esbuild 侧重高性能转换、打包和压缩；Babel 以成熟的 JavaScript 转换插件生态见长。若依赖特定 Babel 插件或复杂自定义语法转换，应评估兼容性；只需常规 TS/JSX 转换和高速构建时 esbuild 很适合。

### `platform: 'node'` 与 `platform: 'browser'` 为什么重要？

它决定模块解析与内建模块处理的语义。Node 产物通常保留或适配 Node 内建模块；浏览器产物不应依赖 Node 内建模块。平台与实际运行环境不匹配会产生运行时解析或兼容问题。

### 是否应把所有依赖都打包？

不应一概而论。浏览器应用通常需要将运行依赖打进静态资源；Node 服务或库往往要将某些依赖外置。选择依据是部署形态、运行时模块解析能力、冷启动、包大小和依赖兼容性。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/构建器/00. 目录|构建器目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/构建器/Rollup|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
