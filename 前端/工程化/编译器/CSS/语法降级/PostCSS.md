# PostCSS

> 官方文档：[PostCSS](https://postcss.org/)。PostCSS 是一个**使用 JavaScript 转换 CSS 的工具**，本体负责解析、遍历和输出 CSS；具体能力由插件实现。

## 核心概念

- PostCSS 不是单一的 CSS 预处理器或“自动加前缀工具”，而是 CSS 转换平台。
- 处理流程通常是：CSS 源码 -> PostCSS 解析为 AST -> 插件按顺序处理 AST -> 输出新的 CSS 与 source map。
- 插件决定转换内容：可做语法降级、兼容性前缀、CSS Modules、代码检查、压缩、变量/嵌套语法处理等。
- 同一份 CSS 可以通过不同插件组合服务不同目标，因此配置比“使用 PostCSS 本体”更重要。

## 常见用途

### Autoprefixer：自动添加浏览器前缀

- `autoprefixer` 根据 Can I Use 数据、目标浏览器范围和属性支持情况，自动补充或移除供应商前缀。
- 它通常与 Browserslist 配合使用；目标浏览器可写在 `package.json`、`.browserslistrc` 或构建配置中。
- 不建议手写 `-webkit-`、`-ms-` 等前缀，交给 Autoprefixer 统一维护更可靠。

```css
/* 输入 */
:fullscreen {
  display: flex;
}

/* 输出会根据目标浏览器按需补充兼容前缀 */
```

### postcss-preset-env：使用现代 CSS

- `postcss-preset-env` 将部分现代 CSS 特性转换为目标浏览器可理解的形式，并依据目标环境选择需要的 polyfill。
- 它使用 CSSDB 管理候选 CSS 特性，适合作为“现代 CSS 到兼容 CSS”的预设组合。
- CSS 无法像 JavaScript 一样为所有新能力完全 polyfill；是否能转换取决于具体语法和浏览器能力，仍应在目标环境中验证。

### CSS Modules 与代码质量

- CSS Modules 可将类名局部化，减少全局命名冲突，例如把 `.name` 编译为带哈希的唯一类名。
- `stylelint` 可检查 CSS 规范和潜在错误，并支持最新 CSS 及 SCSS 等类 CSS 语法。
- `cssnano` 常用于生产构建压缩 CSS；应将压缩与开发环境的可读输出区分开。

## 配置方式

PostCSS 通常通过构建工具调用。工具会读取项目根目录的 `postcss.config.js`（或等价配置），然后按插件声明顺序执行。

```js
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
  },
}
```

也可以使用数组形式，以便传递选项或动态控制插件：

```js
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    autoprefixer(),
  ],
}
```

## 与构建工具的关系

- Vite、Webpack、Rollup 等生态工具可通过各自的 CSS 管道集成 PostCSS；项目通常只需提供配置文件。
- PostCSS 只处理 CSS 转换，不负责打包 JavaScript、模块解析或开发服务器；这些由构建工具承担。
- Sass、Less 等预处理器与 PostCSS 可以串联：预处理器先将自身语法编译为 CSS，再由 PostCSS 做兼容和后处理。具体顺序以构建工具配置为准。

## 插件顺序

- 插件按声明顺序运行，顺序会影响结果。
- 依赖输入语法的插件应在该语法被转换前运行；例如先处理嵌套语法，再做后续兼容性或压缩转换。
- 一般将语法转换与兼容处理放在前面，代码检查多在开发/CI 阶段执行，压缩放在生产流程末尾。
- 不要重复配置功能重叠的插件或预设，否则可能产生重复转换、无效前缀或难以定位的问题。

## 最小实践组合

```bash
npm install -D postcss postcss-preset-env
```

```json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

```js
// 二选一：只需要自动前缀时使用 autoprefixer
import postcssPresetEnv from 'postcss-preset-env'

export default {
  // postcss-preset-env 已包含常用兼容性转换；不要再重复加入 autoprefixer
  plugins: [postcssPresetEnv()],
}
```

## 常见误区

1. **以为 PostCSS 自动做所有兼容**：PostCSS 本体不转换任何语法，必须配置插件。
2. **忽略 Browserslist**：兼容输出取决于目标浏览器；目标范围不明确，会得到不符合项目需求的前缀和转换结果。
3. **把 PostCSS 当作 Sass/Less 的替代品**：二者职责可重叠但不相同，PostCSS 的关键是插件化转换流程。
4. **未关注插件顺序**：插件链是有序的，错误顺序会导致转换失效或输出异常。
5. **开发环境过早压缩**：压缩会降低调试可读性，应通常只在生产构建启用。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/CSS/语法降级/00. 目录|语法降级目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
