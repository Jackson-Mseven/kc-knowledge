# Sass

> 官方文档：[Sass](https://sass-lang.com/)。Sass 是完全兼容 CSS 的扩展语言，提供变量、嵌套、模块、Mixin、函数和控制指令等能力，并在构建时编译为 CSS。

## 1. 语法与实现

- Sass 有两种语法：SCSS 使用 `{}` 与 `;`，是 CSS 的严格超集；缩进语法 `.sass` 使用缩进与换行，省略花括号和分号。
- 工程中通常使用 `.scss`，因为可直接粘贴合法 CSS，且与主流构建工具约定一致。
- **Dart Sass** 是官方主要实现，应作为新项目的默认选择。Ruby Sass 与 LibSass 已废弃，不应在新项目继续依赖。
- Sass 在构建时执行，浏览器最终只接收 CSS；Sass 变量、循环和函数不会保留到运行时。

## 2. 变量与数据类型

- 变量以 `$` 开头，可存放颜色、数字、字符串、列表、映射、布尔值和 `null`。
- 默认变量可使用 `!default`，仅在变量尚未定义时赋值，适合允许外部配置的主题 token。
- `null` 属性值不会输出到 CSS，可用于可选配置。
- Sass 变量是编译期值；需要运行时主题切换、继承或 `var()` 回退时，使用 CSS 自定义属性。

```scss
$brand: #1677ff;
$radius: 6px !default;

.button {
  background: $brand;
  border-radius: $radius;
}
```

## 3. 嵌套与父选择器

- Sass 支持选择器嵌套，便于表达组件内部状态；编译后会生成完整 CSS 选择器。
- `&` 指向外层选择器，可用于伪类、BEM 修饰符和组合选择器。
- 嵌套不是层级越深越好。过深会提高选择器特异性、扩大输出 CSS，并增加覆盖成本。

```scss
.card {
  padding: 16px;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  }

  &__title {
    font-weight: 600;
  }
}
```

## 4. 模块系统：`@use` 与 `@forward`

- 新代码优先使用 `@use` 加载 Sass 模块。每个模块只加载一次，且其成员默认带命名空间，避免全局变量和 mixin 污染。
- `@forward` 用于构建库的公共入口：一个入口文件可转发内部模块，并控制暴露的成员。
- `@import` 会把成员注入全局作用域、重复加载文件，已被弃用；不应在新项目继续使用。
- 可用 `as *` 省略命名空间，但会重新引入命名冲突风险，应谨慎使用。

```scss
// _tokens.scss
$brand: #1677ff;

// button.scss
@use 'tokens';

.button {
  background: tokens.$brand;
}
```

### 配置模块

- `@use ... with (...)` 可在模块首次加载时覆盖其 `!default` 变量，实现主题配置。
- Sass 模块只会按同一份配置加载一次，配置应集中在应用入口，避免不同文件期望不同的模块状态。

```scss
@use 'tokens' with (
  $brand: #722ed1
);
```

## 5. Mixin、函数与占位符

### Mixin

- 使用 `@mixin` 定义可复用样式块，`@include` 引入；可接收默认参数、关键字参数和可变参数。
- Mixin 适合生成带参数的样式，调用处会展开 CSS，频繁使用的大块静态样式要注意产物重复。

```scss
@mixin button-size($padding-y, $padding-x) {
  padding: $padding-y $padding-x;
}

.button {
  @include button-size(8px, 16px);
}
```

### 函数

- `@function` 返回一个 Sass 值，适合封装颜色、尺寸和 token 计算；函数不应直接输出 CSS 规则。
- Sass 内置模块（如 `sass:math`、`sass:color`、`sass:map`、`sass:list`、`sass:string`）提供常用操作，推荐通过模块命名空间调用。

```scss
@use 'sass:math';

@function rem($px) {
  @return math.div($px, 16px) * 1rem;
}
```

### 占位符与 `@extend`

- `%placeholder` 不会单独输出；被 `@extend` 后会与扩展它的选择器合并。
- `@extend` 能减少重复，但会产生跨文件、跨层级的复杂选择器组合。默认优先使用 mixin 或组件类，仅在明确需要选择器合并时使用。

## 6. 控制指令与映射

- `@if`/`@else` 根据条件输出样式，`@each` 遍历列表或映射，`@for` 执行固定次数循环，`@while` 适合少量明确的循环场景。
- 映射（map）适合管理颜色、断点等 token；读取和合并使用 `sass:map` 模块。
- 循环应生成有限、可预测的 CSS。不要为无边界数据生成大量工具类或组合选择器。

```scss
@use 'sass:map';

$breakpoints: (
  sm: 576px,
  md: 768px,
);

@media (min-width: map.get($breakpoints, md)) {
  .container { max-width: 720px; }
}
```

## 7. 编译与构建工具

```bash
npm install -D sass
```

- Vite、Webpack 等构建工具通常可将 `.scss`/`.sass` 纳入 CSS 管道；遵循工具的 loader 或预处理器配置即可。
- Sass 处理预处理语法；自动浏览器前缀、现代 CSS 兼容与压缩仍由 PostCSS、Lightning CSS 或构建工具负责。
- 开发环境启用 source map 以便定位源码；生产环境再结合压缩、拆分与缓存策略优化产物。

## 8. 常见误区

1. **继续使用 `@import`**：新项目应迁移到 `@use`/`@forward`，避免全局污染与重复加载。
2. **把 Sass 变量当作 CSS 变量**：Sass 变量在编译后消失，无法在浏览器运行时动态更新。
3. **嵌套层级过深**：会产生高特异性、难维护的选择器。
4. **滥用 `@extend`**：选择器合并的影响范围不直观，优先用 mixin 或清晰的类组合。
5. **用过时实现编译**：选择 Dart Sass，避免 LibSass/Ruby Sass 的语法和功能差异。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/CSS/预编译/00. 目录|预编译目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/CSS/预编译/Less|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
