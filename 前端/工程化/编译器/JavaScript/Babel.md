# Babel

> 官方文档：[Babel](https://babeljs.io/docs/)。Babel 是一个可插拔的 JavaScript 编译工具链，主要将 ES2015+ 代码转换为能在较旧浏览器或运行时执行的兼容 JavaScript。

## 1. Babel 能做什么

- 转换新的 JavaScript 语法，例如箭头函数、可选链、class、async/await 等。
- 转换 JSX，通常通过 `@babel/preset-react` 配置 React JSX 转换。
- 移除 Flow 或 TypeScript 的类型标注；**Babel 不做类型检查**，项目仍应使用 `tsc`、Flow 或其他检查工具。
- 通过插件组合转换管线，通过 preset 打包一组相关插件。
- 生成 source map，帮助在浏览器调试时映射回源代码。

## 2. 编译流程

```text
源码 -> Parser -> AST -> 插件遍历/转换 -> Generator -> 目标代码 + Source Map
```

- Parser 把 JavaScript/JSX/TypeScript 等源代码解析成抽象语法树（AST）。
- 插件通过访问 AST 节点读取、替换、删除或新增语法结构。
- Generator 根据转换后的 AST 输出 JavaScript 和可选的 source map。
- Babel 尽量遵循 ECMAScript 规范；某些更严格的转换会以代码体积或运行性能为代价。

## 3. 插件与 Preset

### 插件

- 插件是 Babel 最小的转换单元，例如某个新语法的解析/转换、JSX 转换或编译期宏。
- 在配置中，插件按声明顺序执行；当多个插件改写同一语法时，顺序会影响结果。
- 可使用社区插件，也可编写自定义插件来处理 AST。

### Preset

- preset 是一组插件的预设配置，减少逐项配置的成本。
- `@babel/preset-env`：根据目标浏览器或运行时选择所需的 JavaScript 语法转换。
- `@babel/preset-react`：转换 JSX 和 React 相关语法。
- `@babel/preset-typescript`：移除 TypeScript 类型语法，不替代 TypeScript 类型检查。
- 常见项目组合为 `preset-env` 加上 React 或 TypeScript preset，实际取决于源码和目标环境。

## 4. `@babel/preset-env` 与目标环境

- `preset-env` 根据 `targets` 决定哪些语法需要降级，避免把所有现代语法一律转换为 ES5。
- 目标可以直接写在 Babel 配置中，也可复用 Browserslist 定义的浏览器范围。
- 目标环境越旧，输出代码通常越多；应根据真实兼容策略配置，而非盲目面向全部旧浏览器。

```js
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.5%, not dead',
      },
    ],
  ],
}
```

## 5. 语法转换不等于 Polyfill

- Babel 可将 `const`、箭头函数等**语法**转换为旧语法，但不会默认补齐 `Promise`、`Array.prototype.flat`、`Map` 等**运行时 API**。
- 若目标环境缺少这些 API，需要按需求引入 polyfill，例如结合 `core-js`、构建工具或应用运行时策略。
- `@babel/preset-env` 的 `useBuiltIns` 选项可配合 `core-js` 按使用情况或入口注入 polyfill；它会影响全局环境，应明确选择应用级还是库级方案。
- 发布 JavaScript 库时通常不应悄悄污染使用方全局对象；可考虑 runtime helper 方案，并将 polyfill 的责任交给应用方或明确文档化。

## 6. 配置文件

| 配置方式 | 适用范围 | 特点 |
| --- | --- | --- |
| `babel.config.js` | 整个仓库 | 适合 monorepo、跨包配置和统一构建策略。 |
| `.babelrc` / `.babelrc.json` | 当前目录及其子目录 | 适合包级或局部覆盖配置。 |
| `package.json` 的 `babel` 字段 | 当前包 | 适合简单配置，但不适合复杂逻辑。 |

- `babel.config.js` 支持 JavaScript 逻辑，适合根据环境切换配置。
- `env` 可为不同环境提供覆盖配置；例如开发环境保留调试信息，生产环境再加入压缩或特定插件。
- 配置文件会按 Babel 的配置解析规则合并，monorepo 中应明确配置根目录与包边界，避免某个包未被正确处理。

## 7. React 与 TypeScript 示例

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: 'defaults' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
}
```

- React 的自动 JSX runtime 由构建工具和 React 版本共同决定；沿用项目已有约定。
- TypeScript 项目若由 Babel 输出 JavaScript，仍应单独执行 `tsc --noEmit` 做类型检查。
- Babel 只理解它支持的 TypeScript 语法，不能替代 TypeScript 编译器在声明生成、类型检查等方面的能力。

## 8. 常见集成方式

- CLI：`@babel/cli` 用于命令行编译，适合脚本或简单库构建。
- Webpack：通过 `babel-loader` 处理 JavaScript/TypeScript 模块。
- Rollup：通过 Babel 插件将最终产物或指定模块降级。
- Vite：开发阶段通常以 esbuild 为主，生产构建或遗留浏览器兼容可使用官方 Babel/legacy 相关方案。
- Jest：可用 Babel 转换测试中的 JSX、TypeScript 和现代 JavaScript。

## 9. 常见误区

1. **以为 Babel 会自动补齐所有 API**：语法转换与 polyfill 是两件事。
2. **只安装 Babel Core**：还需要根据场景安装 CLI、loader、preset 或插件。
3. **把 Babel 当成 TypeScript 类型检查器**：Babel 会去除类型，不能报告完整类型错误。
4. **未配置 targets**：可能导致过度编译，输出代码更大、调试更困难。
5. **重复处理同一文件**：构建工具、测试工具和库构建应共用或协调 Babel 配置，避免重复转换和不一致产物。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/JavaScript/00. 目录|JavaScript目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/JavaScript/SWC|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
