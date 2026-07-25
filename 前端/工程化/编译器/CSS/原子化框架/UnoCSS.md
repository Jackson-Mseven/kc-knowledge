# UnoCSS

> 官方文档：[UnoCSS](https://unocss.dev/)。UnoCSS 是即时（on-demand）的原子化 CSS 引擎，核心本身不预设工具类；通过 preset、规则、变体和快捷方式按需生成实际使用的 CSS。

## 1. 核心定位

- UnoCSS 扫描源码中使用的类名或属性，只为命中的规则生成 CSS。
- 核心是 un-opinionated 的：具体工具类由 preset 提供，因此可按项目选择 Tailwind/Windi 风格、图标、排版等能力。
- 除了静态工具类，还支持正则匹配的动态规则、变体、快捷方式与自定义 transformer。
- 适合需要高度定制、跨框架复用设计系统，或希望精细控制原子 CSS 规则的项目。

## 2. Vite 接入

```bash
npm install -D unocss
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()],
})
```

在应用入口导入生成的虚拟样式：

```ts
import 'virtual:uno.css'
```

UnoCSS 同时提供 Vite、Webpack、Nuxt、Astro、SvelteKit、CLI 等集成。应使用框架官方集成，而不是手动维护一份生成后的 CSS 文件。

## 3. Preset 机制

Preset 是一组可复用的规则、变体和快捷方式。UnoCSS 通过它们提供工具类能力，而不是在核心中固定一套语法。

```ts
// uno.config.ts
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [presetWind4()],
})
```

常见官方 preset 包括：

- `presetWind4`：提供接近 Tailwind CSS v4 风格的工具类；
- `presetUno`：UnoCSS 的通用预设；
- `presetAttributify`：允许以属性形式书写工具类；
- `presetIcons`：按需生成图标；
- `presetTypography`：排版相关的样式能力。

不同 preset 的语法和默认 token 不完全相同。引入前应统一团队约定，避免在同一项目中混用相近但语义不同的工具类体系。

## 4. 自定义规则（Rules）

规则由匹配器和生成结果组成。静态规则适合简单别名：

```ts
import { defineConfig } from 'unocss'

export default defineConfig({
  rules: [
    ['m-1', { margin: '1px' }],
  ],
})
```

动态规则通常使用正则匹配器和生成函数：

```ts
export default defineConfig({
  rules: [
    [/^m-([.\d]+)$/, ([, value]) => ({ margin: `${value}px` })],
  ],
})
```

当代码使用 `m-7.5` 时，UnoCSS 才生成对应 CSS。正则规则应限制输入范围，避免意外匹配和无边界生成。

## 5. Shortcuts 与 Variants

### Shortcuts

Shortcuts 将一组常用工具类命名为稳定的语义入口，适合按钮、卡片等反复出现的模式：

```ts
export default defineConfig({
  shortcuts: {
    'btn-primary': 'rounded bg-brand px-4 py-2 text-white hover:bg-brand/90',
  },
})
```

Shortcuts 不应演变成另一套难以追踪的 CSS 类库。仅抽取跨组件复用、表达明确的组合。

### Variants

Variant 可转换选择器或包裹规则，用于响应式、伪类、属性状态或团队自定义前缀。它们是 UnoCSS 高扩展性的核心，但应集中配置并补充示例，避免让类名语义不透明。

## 6. Attributify 与图标

`presetAttributify` 可将工具类写为属性，减少长 `class` 字符串：

```html
<button bg="blue-600 hover:blue-700" text="white" px="4" py="2" rounded>
  Save
</button>
```

`presetIcons` 可按需生成图标样式。图标名称来自已配置的 Iconify 集合，项目仍应评估图标包、许可证与构建产物大小。

## 7. 扫描与构建边界

- UnoCSS 同样依赖静态扫描；运行时拼接出的未知类名无法可靠生成。
- 为组件状态建立完整的类名映射，或用规则/shortcuts 表达可枚举模式。
- CSS 产物只包含实际命中的规则，开发中应注意测试路径、内容源与按需加载页面是否均被扫描。
- 生成规则有顺序和优先级；发生冲突时，优先通过设计 token、变体顺序或明确的 CSS 层次解决，而非不断叠加 `!important`。

## 8. Tailwind CSS 与 UnoCSS 的选择

| 维度 | Tailwind CSS | UnoCSS |
| --- | --- | --- |
| 默认体验 | 有完整、约定明确的工具类体系 | 核心极简，能力由 preset 组合 |
| 配置方式 | v4 倾向 CSS-first 主题配置 | TypeScript 配置驱动，规则可编程 |
| 扩展重点 | 主题、变体、工具类组合 | 自定义规则、preset、variant、transformer |
| 适用场景 | 希望遵循成熟约定的产品团队 | 需要高度可编程和可复用原子 CSS 引擎的团队 |

## 9. 常见误区

1. **认为 UnoCSS 自带固定工具类全集**：工具类取决于安装的 preset 和本地规则。
2. **动态拼接未知类名**：按需引擎无法可靠扫描，应使用显式映射或受控规则。
3. **把所有样式都写成正则规则**：规则过宽会难以理解和维护，优先使用 token、shortcuts 和有限匹配。
4. **不管理 preset 边界**：多个 preset 可能有重叠语法或冲突，需要明确优先级与团队规范。
5. **将 Shortcuts 滥用为组件系统**：重复组合才抽取，组件结构和交互逻辑仍应由框架组件承担。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/CSS/原子化框架/00. 目录|原子化框架目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/CSS/原子化框架/Tailwind|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
