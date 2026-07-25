# Husky

> 官方文档：[Husky](https://typicode.github.io/husky/)。Husky 是用于管理 Git 客户端 Hook 的轻量工具，可在提交、推送等 Git 操作前执行检查，从而把代码质量约束前移到本地开发流程。

## 1. 核心概念

- Git Hook 是 Git 在特定事件触发时执行的脚本，例如 `pre-commit`、`commit-msg`、`pre-push`。
- Husky 通过项目中的 `.husky/` 目录管理 Hook 脚本，支持 Git 的全部客户端 Hook。
- Hook 在开发者本机执行，不替代 CI：本地 Hook 用于快速反馈，CI 仍是合并与发布前的最终校验。
- Hook 脚本应保持快速、稳定和可复现；耗时的完整测试或依赖网络的任务更适合放到 CI。

## 2. 安装与初始化

官方推荐使用 `husky init`：它会创建 `.husky/pre-commit`，并在 `package.json` 中添加或更新 `prepare` 脚本。

```bash
npm install --save-dev husky
npx husky init
```

生成后的关键结构：

```text
package.json
.husky/
  pre-commit
```

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

- `prepare` 会在依赖安装后的生命周期中执行，使 Git Hook 配置可随仓库克隆与安装自动生效。
- 使用 pnpm、Yarn 或 Bun 时，安装 Husky 后运行对应包管理器的 `exec husky init` 即可。
- 包为公开发布包而非私有项目时，Yarn 场景可按官方说明配合 `pinst`，避免把安装 Hook 的行为带入消费者安装流程。

## 3. 添加和编写 Hook

创建 `.husky/<hook-name>` 文件即可添加 Hook。当前 Husky 的 Hook 内容可直接写命令，无需沿用旧版的 `husky.sh` 初始化模板。

```sh
# .husky/pre-commit
npm test
```

常用 Hook 与适合执行的任务：

| Hook | 触发时机 | 常见用途 |
| --- | --- | --- |
| `pre-commit` | 创建提交前 | 格式化、lint 暂存文件、快速单测 |
| `commit-msg` | 写入提交信息后 | 校验提交信息格式 |
| `pre-push` | 推送前 | 类型检查、关键测试 |

### `pre-commit` 示例

```sh
# .husky/pre-commit
npx lint-staged
```

`lint-staged` 只处理暂存区文件，通常比对全仓库运行 lint 更适合放在 `pre-commit`。

### `commit-msg` 示例

```sh
# .husky/commit-msg
npx --no-install commitlint --edit "$1"
```

`$1` 是 Git 传入的提交信息文件路径。使用 `--no-install` 可避免 Hook 运行时临时下载依赖，保证行为可预测。

### 多命令与 POSIX Shell

Husky Hook 应使用 POSIX Shell，以兼容 Windows 等不一定具备 Bash 的环境。复杂逻辑可写为普通 Shell 语句，失败命令会以非零状态码阻止 Git 操作。

```sh
# .husky/pre-push
npm run typecheck
npm run test:unit
```

## 4. 跳过或禁用 Hook

Git 提供 `-n` / `--no-verify` 跳过多数 Git Hook：

```bash
git commit -m "chore: emergency fix" --no-verify
```

对于没有该参数的 Git 命令，或需要临时禁用全部 Hook 时：

```bash
HUSKY=0 git rebase origin/main
```

长时间操作可先导出环境变量，结束后再恢复：

```sh
export HUSKY=0
git rebase origin/main
unset HUSKY
```

- 跳过 Hook 应是例外，不能作为修复失败检查的常规手段。
- 要在 GUI 客户端或全局环境禁用，可在 `$XDG_CONFIG_HOME/husky/init.sh`、`~/.config/husky/init.sh`（Windows 为用户配置目录下对应路径）中设置 `HUSKY=0`。

## 5. CI、Docker 与生产安装

- CI/Docker 通常不需要安装或运行本地 Git Hook，可设置 `HUSKY=0`。
- 如果生产安装省略 `devDependencies`，而 `prepare` 仍执行 `husky`，会因 Husky 未安装而失败。
- 简单方案是将 `prepare` 写成 `husky || true`；更严谨的方案是在 `.husky/install.mjs` 中检测 `NODE_ENV` 或 `CI` 后再动态执行 Husky。

```yaml
# GitHub Actions
env:
  HUSKY: 0
```

不要依赖 Hook 来保证 CI 质量。CI 应独立运行 lint、测试和构建，确保 `--no-verify` 或未安装 Husky 时也不会绕过质量门禁。

## 6. 常见问题

### Hook 没有执行

1. 确认项目是 Git 仓库，并且 `.husky/` 和 `prepare` 已提交到版本控制。
2. 执行一次包管理器安装，或手动运行 `npx husky` 以重新设置 Hook。
3. 确认 Hook 文件名与 Git 事件一致，例如 `.husky/pre-commit`。
4. 用 `exit 1` 临时写入 Hook 文件测试，验证 Git 是否真正执行了它。

### GUI 中提示 `command not found`

终端能找到 Node，但 Git GUI 未必会加载 nvm、fnm、asdf、Volta 等版本管理器的初始化环境，因此 Hook 的 `PATH` 可能不包含 Node 或项目二进制目录。应在 Husky 的启动文件中初始化所需环境，或使用 GUI 可见的 Node 安装路径；不要假定 GUI 与交互式 Shell 拥有相同 `PATH`。

### 项目不在 Git 根目录

Husky 为安全起见不会向父目录安装。Monorepo 或子目录项目应在 `prepare` 中先切换到 Git 根目录附近完成 Husky 安装，并在具体 Hook 中 `cd` 回实际项目目录再执行命令。

## 7. 常见误区

1. **把 Hook 当作安全边界**：Hook 可以被 `--no-verify` 跳过，必须由 CI 复验关键规则。
2. **在 `pre-commit` 跑全量测试**：反馈慢会诱发绕过；优先只检查暂存文件和快速任务。
3. **继续复制旧版 Husky 模板**：新版推荐使用 `husky init` 和直接命令，旧的 `husky.sh` 初始化行不应作为新配置范式。
4. **Hook 中自动下载依赖**：会引入网络不确定性；项目依赖应在安装阶段准备好。
5. **忽略跨平台 Shell 差异**：团队包含 Windows 用户时，避免依赖 Bash 专有语法。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/工程化/Git Hooks/00. 目录|Git Hooks目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->
