# tsup

> 官方文档：[tsup](https://tsup.egoist.dev/)。tsup 是由 esbuild 驱动、面向 TypeScript/JavaScript 库的零配置或低配置打包工具，重点解决多入口、多格式、声明文件和发布产物的常见需求。

## 核心能力

- 支持 `.ts`、`.tsx`、`.js`、`.mjs`、`.json` 等 Node 可处理的常见模块；CSS 支持在官方文档中标为实验性。
- 默认输出至 `dist`，支持多入口、ESM/CJS/IIFE 格式、watch、Source Map、压缩、代码分割和 esbuild 插件。
- `--dts` 可生成声明文件；官方明确提示，非 `tsc` 生成的声明不保证无误，应使用 `tsc` 或类型测试工具验证。
- 默认会外置 `package.json` 中的 `dependencies` 与 `peerDependencies`；构建 Node 应用可使用 `tsup-node` 外置所有 Node 包，也可通过 `noExternal` 重新打入指定依赖。

```ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', cli: 'src/cli.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['react'],
})
```

## 常用命令与配置

| 命令/配置 | 用途 |
| --- | --- |
| `tsup src/index.ts` | 构建单个入口到 `dist` |
| `--entry` / `entry` | 声明多个入口，可使用命名入口 |
| `--format esm,cjs` / `format` | 输出一种或多种模块格式 |
| `--dts` / `dts` | 生成 `.d.ts` 声明文件 |
| `--sourcemap` | 生成 Source Map |
| `--watch` | 监听源文件变更 |
| `external` / `noExternal` | 控制依赖外置或打包 |
| `target` | 指定目标环境；ES5 等旧目标应结合实际兼容测试 |

配置可放在 `tsup.config.ts`、`tsup.config.js`、`tsup.config.cjs`、`tsup.config.json` 或 `package.json` 的 `tsup` 字段中。使用 `defineConfig` 可以获得 TypeScript 配置类型和条件配置能力。

## 库发布要点

1. 明确入口与 `package.json` 的 `exports` 映射，避免 ESM/CJS、类型声明和实际文件路径不一致。
2. 将 React 等由消费者提供的 peer dependency 外置，并在 `peerDependencies` 中声明；不要误把运行时必需依赖全部排除。
3. 分别在 ESM 与 CJS 消费环境中测试导入方式、默认导出互操作和类型解析。
4. `dts` 不代替 `tsc` 类型检查，CI 仍应运行类型检查与打包产物测试。

## 常见问题

### tsup 和 esbuild 的关系是什么？

tsup 以 esbuild 作为底层构建能力，在其上封装了适合 TypeScript 库的默认值和功能，如多格式输出、声明文件、入口管理和依赖外置策略。需要极细粒度构建控制时可直接使用 esbuild；构建常规库时 tsup 往往更省配置。

### 为什么库构建常将依赖外置？

外置可减少重复打包，避免把 peer dependency 打入库而出现多份 React 等运行时实例，也让消费者掌控依赖版本。前提是消费者的运行环境能解析该依赖，且包元数据正确声明了它。

### `--dts` 后还需要运行 `tsc` 吗？

需要。tsup 文档说明由非 `tsc` 工具生成的声明不保证完全无误；`tsc --noEmit` 负责类型检查，必要时还应对发布包做消费者侧类型测试。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/构建器/00. 目录|构建器目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 相邻笔记：[[前端/工程化/构建器/Rollup|上一篇]] · [[前端/工程化/构建器/Vite|下一篇]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
