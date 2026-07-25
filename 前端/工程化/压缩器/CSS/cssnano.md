# cssnano

> 官方文档：[cssnano](https://cssnano.github.io/cssnano/)。cssnano 是一个基于 PostCSS 的 CSS 压缩器，通过一组专注的优化插件在构建阶段减小生产 CSS 体积，同时尽量保持原有语义。

## 1. 核心定位

- cssnano 是 **PostCSS 插件**，运行在构建阶段；浏览器最终接收的是优化后的普通 CSS。
- 它不只是删除空格，而是组合 30 多个细粒度转换：规范化选择器、压缩颜色和数值、合并重复规则、移除冗余声明等。
- 压缩是有损的表示变换：源码写法会改变，但在预设承诺的范围内应保持 CSS 的视觉与行为语义。
- 最终产物仍建议使用 Brotli 或 gzip 传输。压缩（minify）和传输压缩（compress）作用不同，组合使用效果更好。

## 2. 工作原理

cssnano 建立在 PostCSS AST 之上：多个 PostCSS 插件可复用同一棵语法树，避免每个工具重复解析 CSS。

常见优化包括：

- 删除注释、空白与无意义分号；
- 规范化选择器，例如将 `::before` 与 `:before` 统一；
- 使用更短的等价值，例如 `#ff0000` 转为 `red`、`0px` 转为 `0`；
- 简写和规范化属性值，例如压缩边距、背景位置和渐变参数；
- 去除重复声明、无效定义或可替换的初始值；
- 在适用时合并等价的规则、关键帧或选择器。

这些转换由独立插件完成，比用正则整体处理 CSS 更可控；但规则合并等变换仍可能受浏览器兼容性、级联顺序和动态注入样式影响。

## 3. 安装与基础接入

```bash
npm install -D cssnano
```

在 PostCSS 配置中作为生产环境插件接入：

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('cssnano')(),
  ],
};
```

- 未传入配置时，cssnano 使用 `default` 预设。
- 通常只在生产构建启用，开发环境保留可读 CSS 和 source map，便于调试。
- 应由构建工具统一维护 PostCSS 插件顺序；常见顺序是先完成语法转换和浏览器前缀处理，再运行 cssnano 压缩最终 CSS。

## 4. 预设（Presets）

从 cssnano 4 起，预设用于选择一组优化插件及其默认选项。这样可按风险和压缩率选择策略，而非默认下载并执行所有激进转换。

### `default` 预设

- 默认预设适合绝大多数项目，提供相对安全的压缩优化。
- 可显式指定，便于团队阅读和统一配置：

```js
require('cssnano')({
  preset: 'default',
});
```

### `advanced` 预设

- `advanced` 会启用更激进的转换，以追求更小产物。
- 这类转换可能改变规则合并方式或依赖更强假设，接入前必须用真实页面、目标浏览器和视觉回归测试验证。
- 不应仅因追求更小体积就全局切换到 `advanced`；先衡量 gzip/Brotli 后的实际收益。

### `lite` 预设

- `lite` 提供更轻量的优化集，适合希望控制转换范围，或已有其他工具承担部分优化的场景。
- 预设可以传入插件选项，也可以传入自定义预设函数。

## 5. 配置方式

cssnano 可在 PostCSS 配置中直接配置，也可使用专用配置文件；当两者都存在时，**PostCSS 配置优先**。

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('cssnano')({
      preset: ['default', {
        discardComments: { removeAll: true },
      }],
    }),
  ],
};
```

专用配置可放在 `package.json` 的 `cssnano` 字段、`.cssnanorc`、`.cssnanorc.config.json` 或 `cssnano.config.js` 中。需要传入函数等 JavaScript 配置时，使用 `cssnano.config.js`。

```js
// cssnano.config.js
const defaultPreset = require('cssnano-preset-default');

module.exports = defaultPreset({
  discardComments: { removeAll: true },
});
```

## 6. 调整或禁用优化

- 预设选项名通常由底层 `postcss-*` 插件名去掉 `postcss-` 前缀并转为 camelCase 得到。
- 可将某个选项设为 `false` 来关闭对应转换；当某段 CSS 有兼容性或构建顺序问题时，应有针对性地关闭，而不是放弃全部压缩。
- 也可以通过 `plugins` 传入单独的 PostCSS 插件。仅在确实需要精确控制时使用，避免复制默认预设的整套配置。

```js
require('cssnano')({
  preset: ['default', {
    // 示例：保留注释处理的默认行为，关闭存在风险的单项转换
    mergeRules: false,
  }],
});
```

## 7. 与其他工具的职责边界

| 工具 | 主要职责 |
| --- | --- |
| Sass / Less | 在构建期扩展和生成 CSS |
| PostCSS | 提供 CSS AST 转换管道 |
| Autoprefixer | 按目标浏览器补充或处理前缀 |
| cssnano | 优化并压缩最终 CSS |
| Lightning CSS | 可同时承担部分转换、兼容和压缩职责，需避免与 cssnano 重复执行相同优化 |

## 8. 常见误区

1. **把 cssnano 当作 gzip 替代品**：它优化 CSS 内容；gzip/Brotli 优化网络传输，生产环境通常二者都需要。
2. **开发环境始终压缩**：会降低调试可读性；应优先在生产构建中启用。
3. **盲目使用 `advanced`**：更高压缩率伴随更高兼容风险，必须做页面与浏览器回归验证。
4. **与其他压缩器重复处理**：同时让 cssnano、Lightning CSS 或 bundler 做重叠的激进优化，收益有限且更难定位问题。
5. **随意删除注释**：许可证注释、工具约定注释或特殊 hack 可能有保留需求，应先确认 `discardComments` 策略。
6. **忽略插件顺序**：在 CSS 尚未完成语法降级、前缀处理前压缩，可能错过优化机会或增加排查成本。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/压缩器/CSS/00. 目录|CSS目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/压缩器/CSS/Lightning CSS|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
