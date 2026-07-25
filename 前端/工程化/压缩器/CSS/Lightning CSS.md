# Lightning CSS

> 官方文档：[Lightning CSS](https://lightningcss.dev/)。Lightning CSS 是一个用 Rust 编写的 CSS 解析、转换、压缩与打包工具，面向现代构建流程，强调高性能和浏览器级 CSS 语法处理。

## 核心定位

- Lightning CSS 会完整解析 CSS 规则、属性和值，再执行转换和压缩；它不是仅靠正则替换的压缩器。
- Rust 实现减少了内存开销和 AST 遍历次数，官网将其定位为比同类 JavaScript 工具快一个数量级以上的 CSS 工具链。
- 一次转换可同时完成现代语法降级、供应商前缀、CSS Modules、压缩和 source map 生成，减少多个独立 CSS 工具之间的重复解析。
- 除 Node.js API 外，也提供 CLI、浏览器可用的 WASM 版本，以及面向构建工具的集成能力。

## 主要能力

### 现代 CSS 与浏览器兼容

- 根据 `targets` 指定的浏览器版本，将 CSS Nesting、自定义媒体查询、逻辑属性、高色域颜色空间和新选择器等转换为更兼容的语法。
- 会依据目标浏览器自动添加必要的供应商前缀，并移除不再需要的前缀，保持源 CSS 简洁。
- 兼容输出取决于目标浏览器范围；应将实际支持策略写入构建配置或 Browserslist，而不是假设默认配置适合所有项目。

```css
/* 输入：现代颜色语法 */
.foo {
  color: oklab(59.686% 0.1009 0.1192);
}

/* 输出会按目标浏览器生成兼容的颜色回退值 */
```

### 压缩

- 启用 `minify` 后，Lightning CSS 会合并可组合的长属性、删除无效或多余的前缀与默认值、合并兼容的相邻规则、简化 `calc()`、缩短颜色和压缩渐变等。
- 压缩建立在完整 CSS 语义解析之上，目标是减小产物体积，同时避免破坏等价语义。
- 通常只在生产构建启用压缩；开发环境优先保留可读 CSS 与 source map，便于调试。

### CSS Modules

- 支持 CSS Modules，并可局部化 class、id、`@keyframes`、CSS 变量等命名，避免不同文件间的命名冲突。
- 会输出原始名称到局部名称的映射，供 JavaScript/TypeScript 导入使用。
- 映射还可帮助构建工具识别未使用的类和变量，从而参与 tree-shaking。

```css
/* 输入 */
.heading {
  color: gray;
}

/* 输出示意：名称会被作用域化 */
.EgL3uq_heading {
  color: gray;
}
```

### 打包与依赖

- `transform` 处理已提供的单个 CSS 字符串或 Buffer。
- `bundle` 从入口 CSS 文件开始解析 `@import` 和 `url()` 等依赖，适合需要由 Lightning CSS 自行解析 CSS 依赖图的场景。
- 在 Vite、Parcel、Rspack 等构建工具中，优先使用其官方 Lightning CSS 集成；由构建工具统一管理 CSS 入口、资源 URL 和产物输出。

## Node.js 基本用法

安装：

```bash
npm install -D lightningcss
```

最小转换示例：

```js
import { transform } from 'lightningcss'

const { code, map, exports } = transform({
  filename: 'src/styles.css',
  code: Buffer.from('.button { color: oklch(61% 0.2 29); }'),
  minify: process.env.NODE_ENV === 'production',
  sourceMap: true,
  cssModules: true,
})

// code 是输出 CSS；map 是 source map；exports 是 CSS Modules 名称映射。
```

若项目已使用 Browserslist，可将其结果转换为 Lightning CSS 的 target 位图：

```js
import browserslist from 'browserslist'
import { browserslistToTargets, transform } from 'lightningcss'

const targets = browserslistToTargets(browserslist('> 0.5%, not dead'))
const result = transform({
  filename: 'src/styles.css',
  code: Buffer.from('a { &:hover { color: red } }'),
  targets,
})
```

## 常用选项

| 选项 | 用途 |
| --- | --- |
| `filename` | 标识源文件，用于错误信息、source map 和 CSS Modules 名称生成。 |
| `code` | 待处理的 CSS 字节内容，Node API 中通常传 `Buffer`。 |
| `minify` | 启用生产级 CSS 压缩。 |
| `targets` | 指定目标浏览器，决定兼容转换与前缀。 |
| `sourceMap` | 生成 source map。 |
| `cssModules` | 启用 CSS Modules，可传对象进一步配置。 |
| `drafts` | 启用仍处于草案阶段的 CSS 特性支持。 |

## 与 PostCSS 的关系

- PostCSS 是 JavaScript 插件驱动的 CSS 转换平台，生态覆盖 lint、兼容、语法扩展等大量定制需求。
- Lightning CSS 内置了高性能的解析、兼容转换、前缀、压缩和 CSS Modules，适合希望减少 CSS 工具链层数的构建流程。
- 两者并非完全替代关系：若项目依赖特定 PostCSS 插件，仍需要保留 PostCSS；若只需常见兼容与压缩能力，Lightning CSS 往往可简化配置并提升构建速度。

## 实践建议

1. 优先复用构建工具的官方集成，不要同时让多个 CSS 处理器对同一文件重复做前缀和压缩。
2. 明确浏览器目标并在 CI 中固定它，避免不同机器生成不一致的兼容 CSS。
3. 为生产构建开启 `minify`，为开发构建保留 source map。
4. 启用 CSS Modules 后，通过导出的映射访问类名，不依赖源码中的局部类名字符串。
5. 在迁移前检查现有 PostCSS 插件是否有等价能力；Lint、行业私有语法或特定转换插件可能仍需 PostCSS。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/压缩器/CSS/00. 目录|CSS目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/压缩器/CSS/cssnano|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
