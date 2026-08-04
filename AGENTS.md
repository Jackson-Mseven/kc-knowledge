# Obsidian Vault Instructions

## Scope

This repository is an Obsidian technical knowledge base. Preserve existing notes, attachments, internal links, and user-authored changes.

## Required Context

Before creating, importing, moving, or editing any knowledge-base note:

1. Read `AI 知识库维护说明.md` completely and follow it.
2. Read `00. 知识库导航.md`.
3. Read the nearest `00. 目录.md` and the applicable domain map:
   - `前端/00. 前端知识地图.md`
   - `计算机基础/00. 计算机基础知识地图.md`
   - `Git/00. Git知识地图.md`
4. Search for existing notes and aliases before creating a new file.

## Knowledge-Base Rules

- Write explanations in Simplified Chinese. Keep official API names, commands, types, and identifiers in English.
- Prefer official documentation, standards, repositories, RFCs, and release notes for version-sensitive claims.
- Include concepts, mechanisms, self-contained examples, production caveats, advantages, limitations, use cases, and interview questions when relevant.
- Use full Vault-relative Obsidian links such as `[[前端/浏览器/3. JavaScript运行时与事件循环|事件循环]]` when linking notes.
- Add semantic links only where the relationship is useful; do not inflate the graph with repeated keyword links.
- Do not manually edit content inside `obsidian-nav` or `obsidian-auto-index` managed blocks.
- Do not modify `.obsidian`, rename, move, or delete user files unless the user explicitly requests it.
- Preserve imported article meaning and attachment paths. Never overwrite unrelated or pre-existing user changes.

## AI 内容生成规范

- 内容以核心、准确、精炼为第一目标，用尽可能少的文字讲清概念、机制、边界和关键差异。
- 不套用固定文章模板。标题只在能组织独立信息时使用，不为满足格式机械添加“实践要点”“验证清单”“优势与限制”“适用场景”“面试题”等章节。
- 禁止重复、空泛和不可操作的表述，例如“结合实际验证”“从多个角度理解”“如何说明某主题的工程价值”。每段都应提供该主题独有的信息。
- 同一结论只保留一处完整解释；其他笔记通过语义双链引用，避免换一种措辞重复正文。
- 内容短、强相关且需要连续理解的主题应合并；只有具备独立学习目标、足够知识密度或明确检索价值时才拆成单独笔记。
- 示例只在能帮助理解机制、API 或易错边界时添加，保持最小、自洽、可运行；不为每篇笔记强行增加示例。
- 生产注意事项必须具体说明风险、触发条件与处理方式；面试题必须检验该主题的核心机制，不能使用通用问法凑数。
- 扩充目录前先检查已有内容，优先精炼、合并和补缺，不以文件数量或篇幅作为完整性的衡量标准。

## Completion Requirements

After changing Markdown files or their locations, run from the Vault root:

```bash
node "工具/更新 Obsidian 关联.mjs"
```

The command must complete with all validation counts at zero for broken links, orphan/isolated/unreachable notes, unclosed code fences, missing attachments, and unreferenced attachments. Fix relevant failures before reporting completion.

In the final response, report the files changed, the important content added, the validation result, and any checks that could not be performed.
