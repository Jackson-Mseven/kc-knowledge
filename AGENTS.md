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

## AI Content Generation Rules

- Make core accuracy, relevance, and concision the primary goals. Explain the concept, mechanism, boundary, and key differences with as few words as possible.
- Do not apply a fixed article template mechanically. Add a heading only when it organizes an independent piece of information; do not add generic sections such as “practical tips,” “validation checklist,” “advantages and limitations,” or “use cases” merely to satisfy a format.
- Avoid repetition, vague claims, and non-actionable wording such as “validate this in practice,” “understand it from multiple angles,” or “explain the engineering value of this topic.” Every paragraph must provide information specific to the topic.
- Keep one complete explanation of each conclusion in one place. Use semantic links elsewhere instead of restating the same conclusion with different wording.
- For broad technical topics, prefer a small sequence of substantial notes that progresses from fundamentals to advanced material, following the structure of `后端/缓存/Redis/`. Do not create many short files for isolated subtopics; merge related concepts unless a topic has enough depth and an independent learning path to justify its own note.
- Merge topics that are short, tightly related, and require continuous understanding. Split only when a topic has an independent learning goal, sufficient information density, or clear retrieval value.
- Add examples only when they clarify a mechanism, API, or error-prone boundary. Keep examples minimal, self-contained, and runnable; do not force an example into every note.
- Production guidance must state the concrete risk, trigger condition, and response. Interview questions must test the topic's core mechanism rather than fill space with generic questions.
- Inspect existing content before expanding a directory. Prefer refining, merging, and filling gaps over measuring completeness by file count or length.

## Completion Requirements

After changing Markdown files or their locations, run from the Vault root:

```bash
node "工具/更新 Obsidian 关联.mjs"
```

The command must complete with all validation counts at zero for broken links, orphan/isolated/unreachable notes, unclosed code fences, missing attachments, and unreferenced attachments. Fix relevant failures before reporting completion.

In the final response, report the files changed, the important content added, the validation result, and any checks that could not be performed.
