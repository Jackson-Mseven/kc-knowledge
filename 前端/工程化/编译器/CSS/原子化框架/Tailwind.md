# Tailwind CSS

> 官方文档：[Tailwind CSS](https://tailwindcss.com/docs)。Tailwind CSS 是 utility-first CSS 框架：在模板中组合低粒度工具类，由构建工具扫描源码并生成对应的静态 CSS，浏览器端没有运行时依赖。

## 1. 工作方式

- Tailwind 扫描 HTML、JS/TS 组件和其他模板中的类名，只为实际出现的工具类生成 CSS。
- 常用能力以原子类表达：布局、间距、尺寸、颜色、排版、边框、阴影、动画和交互状态等。
- 通过组合类名描述组件样式，而不是为每个组件先创建一组语义 CSS 类。
- 它是构建期工具，最终产物是普通 CSS；未被扫描到的动态拼接类名不会被生成。

```html
<button class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
  Save
</button>
```

## 2. Vite 接入（Tailwind v4）

Tailwind v4 推荐通过 Vite 插件接入：

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

在应用入口 CSS 中导入 Tailwind：

```css
@import "tailwindcss";
```

- 框架需确保入口 CSS 被加载到页面中。
- v4 采用 CSS-first 配置；旧项目中的 `tailwind.config.js` 与 `@tailwind base/components/utilities` 属于 v3 常见写法，迁移时应按版本文档处理。

## 3. 设计令牌与主题

v4 可用 `@theme` 在 CSS 中定义可被工具类消费的设计令牌，例如颜色、字体和断点：

```css
@import "tailwindcss";

@theme {
  --color-brand: #1677ff;
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
```

这些变量会派生出相应工具类，例如 `bg-brand`、`font-display` 与 `3xl:*` 变体。令牌应集中维护，避免在组件中散落近似颜色和尺寸。

## 4. 响应式与状态变体

Tailwind 通过前缀变体组合条件，移动端优先：未加断点前缀的类作用于所有尺寸，`md:` 等前缀从对应最小宽度开始覆盖。

```html
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  <a class="text-slate-700 hover:text-brand focus-visible:outline-2 dark:text-slate-200">
    Item
  </a>
</div>
```

常见变体：

- 响应式：`sm:`、`md:`、`lg:`、`xl:`、`2xl:`；
- 状态：`hover:`、`focus:`、`focus-visible:`、`disabled:`、`active:`；
- 结构与属性：`first:`、`odd:`、`group-hover:`、`peer-checked:`、`data-[state=open]:`；
- 媒体偏好：`dark:`、`motion-reduce:`、`print:`。

变体可叠加，但应控制可读性；复杂状态更适合提取成组件或使用语义化封装。

## 5. 任意值与自定义 CSS

- 任意值可处理少量无法由主题覆盖的精确需求，例如 `top-[117px]`、`grid-cols-[200px_1fr]`。
- 任意属性可用于临时接入原生 CSS 能力，例如 `[mask-type:luminance]`。
- 不要把任意值当作常规设计 token；重复出现的值应提升到 `@theme` 或组件 API 中。

```html
<div class="grid grid-cols-[16rem_1fr] gap-[18px]">
  ...
</div>
```

## 6. 类名扫描与动态类风险

Tailwind 以文本形式扫描源码，不会执行 JavaScript 来推断字符串拼接结果。

```tsx
// 不推荐：运行时拼接，构建器可能无法扫描到完整类名
const className = `bg-${color}-600`

// 推荐：显式映射完整类名
const colorClass = {
  blue: 'bg-blue-600',
  red: 'bg-red-600',
}[color]
```

- 外部包、monorepo 包或未被自动发现的源码可通过 `@source` 显式声明扫描来源。
- 对无法静态枚举的类名，应重构为完整字符串映射；仅在必要时使用 safelist 或额外扫描配置。

## 7. 组织方式与最佳实践

1. 用设计 token 统一颜色、间距、字体和断点，避免页面级硬编码。
2. 先以类组合完成局部样式；重复且稳定的组合再抽为组件，而不是过早封装每个工具类。
3. 将复杂条件类名交给 `clsx`、`cva` 等工具或组件变体 API 管理。
4. 保留可访问性状态，如 `focus-visible`、`disabled` 和降低动画的 `motion-reduce`。
5. 定期检查生成 CSS 与扫描路径，防止动态类遗漏或过宽扫描增加构建成本。

## 8. 常见误区

1. **把 Tailwind 当作运行时 CSS-in-JS**：它生成静态 CSS，不会在浏览器动态解释类名。
2. **动态拼接工具类**：扫描不到的类不会出现在产物中，应映射完整类名。
3. **滥用任意值**：会绕开 token 体系并降低一致性。
4. **只使用 `hover:`**：键盘用户还需要明确的焦点可见状态。
5. **混用 v3 与 v4 配置习惯**：先确认项目版本，再采用对应的安装和主题配置方式。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/CSS/原子化框架/00. 目录|原子化框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/CSS/原子化框架/UnoCSS|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
