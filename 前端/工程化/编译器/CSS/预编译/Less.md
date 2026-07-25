# Less

> 官方文档：[Less 中文文档](https://less.bootcss.com/)。Less（Leaner Style Sheets）是一门向后兼容 CSS 的扩展语言，通过 Less.js 或构建工具编译为普通 CSS。

## 1. Less 的定位

- Less 在 CSS 基础上增加变量、嵌套、Mixin、函数、运算、作用域和模块导入等能力，最终产物仍是浏览器可识别的 CSS。
- 它与 Sass 类似，属于 CSS 预处理器；它解决的是样式组织与编写效率，而不是浏览器前缀或新 CSS 语法兼容的全部问题。
- 生产项目通常由 Vite、Webpack 等构建工具在构建阶段编译 Less；浏览器端运行 Less.js 更适合演示和调试，不适合生产环境。

## 2. 变量

- 变量以 `@` 开头，可保存颜色、尺寸、选择器、URL 和其他 CSS 值，避免重复的魔法值。
- Less 变量是延迟加载（lazy loading）的：可在声明前引用，最终取同一作用域中最后一次定义的值。
- 变量遵循作用域，局部定义会遮蔽外层变量；不要依赖“最后一次定义”的隐式行为，主题变量应集中声明。

```less
@brand-color: #1677ff;
@spacing: 8px;

.button {
  color: @brand-color;
  padding: @spacing (@spacing * 2);
}
```

## 3. 嵌套与父选择器

- Less 可将选择器嵌套，结构上接近 HTML，但过深嵌套会生成高特异性选择器，应控制在合理层级。
- `&` 表示当前父选择器，常用于伪类、修饰符和组合选择器。
- 多层嵌套会产生选择器组合，编译后可能显著增加 CSS 体积和覆盖难度。

```less
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

## 4. Mixin 与参数化复用

- Mixin 将一组属性混入另一个规则集；类或 ID 规则集都可作为 mixin 使用。
- 参数化 mixin 可设置默认值和可变参数，适合封装边框、排版、响应式断点等可配置样式片段。
- Mixin 会在调用处展开 CSS。它适合复用属性，不应无节制地替代语义化组件类，否则会重复输出大量样式。

```less
.rounded(@radius: 4px) {
  border-radius: @radius;
}

.button {
  .rounded(8px);
  padding: 8px 16px;
}
```

### 命名空间与访问符

- 可把 mixin 放入命名空间规则集，再用 `.namespace.mixin()` 调用，避免全局命名冲突。
- Less 支持从命名空间中访问变量、mixin 等成员，适合组织内部样式工具库。

```less
#tools() {
  .centered() {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.dialog {
  #tools.centered();
}
```

## 5. `@` 规则嵌套与冒泡

- `@media`、`@supports` 等 `@` 规则可嵌套在选择器中。
- 编译时，`@` 规则会被“冒泡”到外层，同时保留原选择器上下文，便于将组件的响应式样式放在组件附近。

```less
.sidebar {
  width: 280px;

  @media (max-width: 768px) {
    width: 100%;
  }
}
```

## 6. 运算、函数与映射

- Less 支持颜色、数值、字符串、列表等运算，例如 `@spacing * 2`；注意单位运算的结果是否符合预期。
- `calc()` 中的表达式通常保持为原生 CSS 计算，避免 Less 在不应处理时提前求值。
- 内置函数覆盖颜色处理、数学、字符串、列表、类型判断等场景；应优先使用标准 CSS 函数时保持原生 CSS。
- 映射（Maps）允许把规则集或变量组合为键值集合，可用于主题 token 或断点配置；读取时注意可读性，复杂配置可改用 CSS 自定义属性或设计 token 工具。

```less
@theme: {
  primary: #1677ff;
  danger: #ff4d4f;
};

.alert {
  color: @theme[primary];
}
```

## 7. 导入与模块拆分

- `@import` 导入其他 Less 或 CSS 文件，默认会把 `.less` 后缀补全。
- 常用导入选项：`(reference)` 只导入变量/mixin、不直接输出 CSS；`(inline)` 原样内联；`(optional)` 文件缺失时不报错；`(multiple)` 允许重复导入。
- 基础变量、函数、mixin 可放在 `tokens.less`、`mixins.less` 等文件，并通过 `(reference)` 引入，避免每个业务文件重复输出基础样式。

```less
@import (reference) './mixins.less';
@import './components/button.less';
```

## 8. 编译方式

### Node.js 与构建工具

```bash
npm install -D less
```

- Vite、Webpack 的 CSS 管道通常可识别 `.less` 文件，按工具文档配置 Less 选项即可。
- 在大型项目中，让构建工具统一处理 Less、PostCSS、Autoprefixer、压缩和 source map，避免重复编译同一文件。
- Less 负责编译预处理语法；浏览器兼容前缀与语法降级仍可交由 PostCSS/Autoprefixer 或构建工具方案处理。

### 浏览器端 Less.js

- Less 官方提供浏览器端 `less.js` 用法，可通过 `<link rel="stylesheet/less">` 加载 `.less` 文件。
- 这种方式会在用户浏览器内编译，增加首屏成本和运行时开销，生产环境应预先构建为 CSS。

## 9. 常见误区

1. **嵌套过深**：会生成高特异性选择器，后续覆盖困难；优先扁平化选择器与组件命名。
2. **把 mixin 当作所有复用方案**：mixin 会复制输出属性，公共组件样式应视情况使用独立类、CSS Modules 或设计系统。
3. **在浏览器中编译生产 Less**：应在构建阶段完成编译。
4. **混淆 Less 变量与 CSS 自定义属性**：Less 变量在构建时消失，CSS 变量保留到运行时且能被主题切换、`var()` 等使用。
5. **忽略 import 产生的重复输出**：基础工具文件使用 `(reference)`，并保持清晰的导入边界。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/CSS/预编译/00. 目录|预编译目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/CSS/预编译/Sass|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
