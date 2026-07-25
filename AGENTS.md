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

## Completion Requirements

After changing Markdown files or their locations, run from the Vault root:

```bash
node "工具/更新 Obsidian 关联.mjs"
```

The command must complete with all validation counts at zero for broken links, orphan/isolated/unreachable notes, unclosed code fences, missing attachments, and unreferenced attachments. Fix relevant failures before reporting completion.

In the final response, report the files changed, the important content added, the validation result, and any checks that could not be performed.
