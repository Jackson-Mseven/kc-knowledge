# SWC

> 官方文档：[SWC](https://swc.rs/)。SWC（Speedy Web Compiler）是以 Rust 实现的 JavaScript/TypeScript 编译工具链，提供解析、语法转换、压缩和 Bundler 等能力，并通过原生绑定供 Node.js 构建工具调用。

## 1. 核心定位

- SWC 在构建期将现代 JavaScript、TypeScript、JSX/TSX 或 Flow 转换为目标运行环境可执行的 JavaScript。
- 核心包是 `@swc/core`，提供异步与同步 API；上层工具、框架或 loader 通常基于它集成。
- Rust 实现和原生绑定使其适合高频编译场景，但实际构建速度还受 I/O、依赖图、缓存、类型检查和其他插件影响。
- SWC 负责语法转换，不替代 TypeScript 类型检查；项目仍应单独运行 `tsc --noEmit` 或等价的类型检查流程。

## 2. 安装与核心 API

```bash
npm install -D @swc/core @swc/cli
```

`@swc/core` 的主要 API：

| API | 用途 |
| --- | --- |
| `transform` / `transformSync` | 转换代码字符串或 AST |
| `transformFile` / `transformFileSync` | 转换文件 |
| `parse` / `parseSync` | 解析为 SWC AST |
| `minify` / `minifySync` | 压缩 JavaScript |

```ts
import { transform } from '@swc/core'

const output = await transform(source, {
  filename: 'src/App.tsx',
  sourceMaps: true,
  jsc: {
    parser: { syntax: 'typescript', tsx: true },
    target: 'es2022',
  },
})

console.log(output.code)
```

- `transform` 返回 `{ code, map? }`；`sourceMaps: true` 将 map 放在结果中，`inline` 则把 map 作为 data URL 追加到输出。
- 传入 `filename` 很重要：插件、`test`/`exclude`/`ignore` 匹配及按文件查找 `.swcrc` 都可能依赖它。

## 3. `.swcrc` 配置

SWC 可在待编译文件附近读取 `.swcrc`，也可在上层工具中以内联配置传入。官方提供 JSON Schema：

```json
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    },
    "target": "es2022"
  },
  "sourceMaps": true
}
```

关键字段：

- `jsc.parser`：选择 `ecmascript`、`typescript` 或 `flow`，并开启 `jsx`、`tsx`、装饰器等对应语法；
- `jsc.target`：按 ECMAScript 目标版本降级语法，例如 `es2022`、`es2017`；
- `jsc.transform`：配置 React、装饰器等转换；
- `module`：控制 ESM、CommonJS 等模块输出；
- `sourceMaps`：生成独立或内联 source map；
- `minify` / 压缩相关选项：控制生产压缩行为。

配置应与当前编译链的职责一致。例如 Bundler 已处理模块格式和压缩时，不应在多个环节重复进行同类转换。

## 4. 解析与语法转换

### TypeScript、TSX 与 Flow

```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    }
  }
}
```

- TypeScript/Flow 的类型语法会在转换中移除，不会产生运行时类型检查。
- 处理 Flow 时设置 `jsc.parser.syntax` 为 `flow`；SWC 会解析 Flow 并剥离仅类型构造。
- 解析器选项应与文件实际语法匹配。对普通 `.ts` 开启 `tsx`、或错误启用装饰器，都可能掩盖配置问题。

### React 转换

React 项目通常通过 `jsc.transform.react` 指定 JSX 转换策略，例如选择自动运行时：

```json
{
  "jsc": {
    "parser": { "syntax": "typescript", "tsx": true },
    "transform": {
      "react": { "runtime": "automatic" }
    }
  }
}
```

应由项目的 React 版本、框架和 Bundler 约定决定运行时与开发模式配置，避免同时被多个插件重复转换 JSX。

## 5. 目标浏览器与 `env`

SWC 提供类似 `preset-env` 的 `env` 配置，可按 Browserslist 风格目标决定需要的转换：

```json
{
  "jsc": {
    "parser": { "syntax": "typescript", "tsx": true },
    "externalHelpers": true
  },
  "env": {
    "targets": "Chrome >= 48"
  }
}
```

- `env.targets` 可使用查询字符串或浏览器版本映射；
- `env.mode` 支持 `usage`、`entry` 或 `false`，用于 polyfill 注入策略；
- `env` 与 `jsc.target` 是两套目标策略，官方明确 `env` 不与 `jsc.target` 配合使用；项目应选择一种作为主策略；
- 语法降级不等于完整运行时 polyfill。API 兼容需求仍要根据目标环境和 polyfill 策略处理。

## 6. 压缩与 Bundler

### 压缩

SWC 提供 `minify` / `minifySync` 和压缩配置，可用于压缩 JavaScript。压缩会改变代码形态，生产环境应保留 source map、验证错误堆栈与关键运行时行为。

不要同时让 SWC、Bundler 和其他压缩器对同一份最终 JS 重复做激进压缩。应选择一个主压缩环节，并以 gzip/Brotli 后的产物体积和构建时间评估收益。

### Bundler

SWC 还提供 Bundler 能力，但在多数应用工程中，更常见的方式是将 SWC 作为 Vite、Webpack、Rspack、Next.js 等上层工具的编译器。选择 Bundler 时需单独评估其插件生态、代码分割、CSS/资源处理、开发服务器和生产需求，而非只比较转换速度。

## 7. 与 Babel 的关系

| 维度 | SWC | Babel |
| --- | --- | --- |
| 实现语言 | Rust，常通过原生绑定运行 | JavaScript |
| 核心定位 | 高性能解析、转换与压缩工具链 | 成熟的 JavaScript 编译与插件生态 |
| 扩展方式 | 配置、插件与上层工具集成 | 大量 Babel 插件与预设 |
| 适用判断 | 构建吞吐、框架默认集成与兼容配置 | 依赖特定 Babel 插件或复杂自定义转换 |

两者不是必须二选一的抽象概念：应优先遵循框架和构建工具的默认编译链；只有在需要特定插件能力或迁移优化时才替换底层编译器。

## 8. 常见误区

1. **把 SWC 当作 TypeScript 类型检查器**：SWC 会移除类型，类型错误仍需 `tsc` 等工具检测。
2. **忽略 `filename`**：会影响 `.swcrc` 查找、过滤匹配和部分插件行为。
3. **同时设置 `env` 与 `jsc.target` 期待叠加**：应选择一套目标策略，避免转换预期不清晰。
4. **只因速度替换整条构建链**：还需验证插件、模块处理、缓存、代码分割与调试体验。
5. **在多个阶段重复压缩**：增加构建成本并使 source map 与问题定位更复杂。
6. **忘记 source map**：生产压缩后的错误追踪和性能排查通常依赖 source map。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/编译器/JavaScript/00. 目录|JavaScript目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/编译器/JavaScript/Babel|上一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
