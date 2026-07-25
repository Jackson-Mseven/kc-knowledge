import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const GENERIC_INDEX = '00. 目录.md'
const NAV_START = '<!-- obsidian-nav:start -->'
const NAV_END = '<!-- obsidian-nav:end -->'
const AUTO_START = '<!-- obsidian-auto-index:start -->'
const AUTO_END = '<!-- obsidian-auto-index:end -->'
const IGNORED_DIRECTORIES = new Set(['.git', '.obsidian', '.trash', 'node_modules', '工具'])
const NON_NOTE_MARKDOWN = new Set(['AGENTS.md', 'AGENTS.override.md'])

const specialIndexes = new Map([
  ['', '00. 知识库导航.md'],
  ['前端', '前端/00. 前端知识地图.md'],
  ['计算机基础', '计算机基础/00. 计算机基础知识地图.md'],
  ['Git', 'Git/00. Git知识地图.md'],
])

const collator = new Intl.Collator('zh-CN', {
  numeric: true,
  sensitivity: 'base',
})

const toPosix = (value) => value.split(path.sep).join('/')
const fromRoot = (value) => toPosix(path.relative(ROOT, value))
const withoutExtension = (value) => value.replace(/\.md$/i, '')
const displayName = (value) => path.posix.basename(withoutExtension(value))
const wikiLink = (file, alias = displayName(file)) => `[[${withoutExtension(file)}|${alias}]]`

function isIgnored(relativePath) {
  return relativePath
    .split('/')
    .filter(Boolean)
    .some((part) => IGNORED_DIRECTORIES.has(part))
}

function listMarkdownFiles(directory = ROOT) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    const relativePath = fromRoot(absolutePath)

    if (entry.isDirectory()) {
      if (!isIgnored(relativePath)) files.push(...listMarkdownFiles(absolutePath))
      continue
    }

    if (
      entry.isFile()
      && entry.name.endsWith('.md')
      && !NON_NOTE_MARKDOWN.has(entry.name)
      && !isIgnored(relativePath)
    ) {
      files.push(relativePath)
    }
  }

  return files.sort((a, b) => collator.compare(a, b))
}

function listVaultFiles(directory = ROOT) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    const relativePath = fromRoot(absolutePath)
    const parts = relativePath.split('/').filter(Boolean)
    const ignored = parts.some((part) => ['.git', '.obsidian', '.trash', 'node_modules'].includes(part))

    if (ignored) continue
    if (entry.isDirectory()) files.push(...listVaultFiles(absolutePath))
    if (entry.isFile() && entry.name !== '.DS_Store') files.push(relativePath)
  }

  return files.sort((a, b) => collator.compare(a, b))
}

function isGeneratedIndex(file) {
  return path.posix.basename(file) === GENERIC_INDEX
}

function isSpecialIndex(file) {
  return [...specialIndexes.values()].includes(file)
}

function isContentNote(file) {
  return !isGeneratedIndex(file) && !isSpecialIndex(file)
}

function contentDirectories(files) {
  const directories = new Set([''])

  for (const file of files.filter(isContentNote)) {
    let directory = path.posix.dirname(file)
    if (directory === '.') directory = ''

    while (true) {
      directories.add(directory)
      if (!directory) break
      const parent = path.posix.dirname(directory)
      directory = parent === '.' ? '' : parent
    }
  }

  return directories
}

function indexForDirectory(directory) {
  if (specialIndexes.has(directory)) return specialIndexes.get(directory)
  return directory ? `${directory}/${GENERIC_INDEX}` : specialIndexes.get('')
}

function parentDirectory(directory) {
  if (!directory) return null
  const parent = path.posix.dirname(directory)
  return parent === '.' ? '' : parent
}

function directContentFiles(directory, files) {
  return files
    .filter(isContentNote)
    .filter((file) => {
      const parent = path.posix.dirname(file)
      return (parent === '.' ? '' : parent) === directory
    })
    .sort((a, b) => collator.compare(path.posix.basename(a), path.posix.basename(b)))
}

function directChildDirectories(directory, directories) {
  return [...directories]
    .filter((candidate) => candidate && parentDirectory(candidate) === directory)
    .sort((a, b) => collator.compare(path.posix.basename(a), path.posix.basename(b)))
}

function writeIfChanged(relativePath, content) {
  const absolutePath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  const normalized = `${content.trimEnd()}\n`
  const previous = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : null

  if (previous !== normalized) {
    fs.writeFileSync(absolutePath, normalized)
    return true
  }

  return false
}

function replaceManagedBlock(source, start, end, body) {
  const block = `${start}\n${body.trim()}\n${end}`
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end)

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return `${source.slice(0, startIndex).trimEnd()}\n\n${block}${source.slice(endIndex + end.length)}`
  }

  return `${source.trimEnd()}\n\n${block}\n`
}

function createGenericIndexes(files, directories) {
  let changed = 0

  for (const directory of [...directories].sort(collator.compare)) {
    if (!directory || specialIndexes.has(directory)) continue

    const indexPath = indexForDirectory(directory)
    const title = `${path.posix.basename(directory)}目录`
    const parent = parentDirectory(directory)
    const parentIndex = indexForDirectory(parent ?? '')
    const notes = directContentFiles(directory, files)
    const children = directChildDirectories(directory, directories)

    const noteLines = notes.length
      ? notes.map((file) => `- ${wikiLink(file)}`).join('\n')
      : '- 本目录暂时没有直接笔记。'
    const childLines = children.length
      ? children.map((child) => `- ${wikiLink(indexForDirectory(child), `${path.posix.basename(child)}目录`)}`).join('\n')
      : '- 本目录没有下级目录。'

    const content = `# ${title}

> 此索引由 [[AI 知识库维护说明]] 与维护脚本自动管理。上级：${wikiLink(parentIndex, parent ? `${path.posix.basename(parent)}目录` : '知识库导航')}。

## 本目录笔记

${noteLines}

## 子目录

${childLines}
`

    if (writeIfChanged(indexPath, content)) changed += 1
  }

  return changed
}

function updateSpecialIndex(relativePath, directory, files, directories) {
  const absolutePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(absolutePath)) return false

  const notes = directContentFiles(directory, files)
  const children = directChildDirectories(directory, directories)
  const lines = []

  if (notes.length) {
    lines.push('### 直属笔记', '')
    lines.push(...notes.map((file) => `- ${wikiLink(file)}`), '')
  }

  if (children.length) {
    lines.push('### 子目录入口', '')
    lines.push(...children.map((child) => `- ${wikiLink(indexForDirectory(child), `${path.posix.basename(child)}目录`)}`))
  }

  const source = fs.readFileSync(absolutePath, 'utf8')
  const updated = replaceManagedBlock(source, AUTO_START, AUTO_END, lines.join('\n'))
  return writeIfChanged(relativePath, updated)
}

function domainIndexFor(file) {
  const topLevel = file.split('/')[0]
  return specialIndexes.get(topLevel) ?? specialIndexes.get('')
}

function updateNoteNavigations(files) {
  const groups = new Map()

  for (const file of files.filter(isContentNote)) {
    const rawDirectory = path.posix.dirname(file)
    const directory = rawDirectory === '.' ? '' : rawDirectory
    if (!groups.has(directory)) groups.set(directory, [])
    groups.get(directory).push(file)
  }

  let changed = 0

  for (const [directory, notes] of groups) {
    notes.sort((a, b) => collator.compare(path.posix.basename(a), path.posix.basename(b)))

    notes.forEach((file, index) => {
      if (file === 'AI 知识库维护说明.md') return

      const absolutePath = path.join(ROOT, file)
      const source = fs.readFileSync(absolutePath, 'utf8')
      const directoryIndex = indexForDirectory(directory)
      const domainIndex = domainIndexFor(file)
      const previous = notes[index - 1]
      const next = notes[index + 1]
      const lines = ['---', '## 关联导航', '']

      if (directoryIndex) {
        lines.push(`- 所属目录：${wikiLink(directoryIndex, directory ? `${path.posix.basename(directory)}目录` : '知识库导航')}`)
      }

      if (domainIndex && domainIndex !== directoryIndex) {
        const alias = displayName(domainIndex).replace(/^00\.\s*/, '')
        lines.push(`- 领域入口：${wikiLink(domainIndex, alias)}`)
      }

      const adjacent = []
      if (previous) adjacent.push(wikiLink(previous, '上一篇'))
      if (next) adjacent.push(wikiLink(next, '下一篇'))
      if (adjacent.length) lines.push(`- 相邻笔记：${adjacent.join(' · ')}`)

      if (specialIndexes.get('') !== directoryIndex) {
        lines.push(`- 总导航：${wikiLink(specialIndexes.get(''), '知识库导航')}`)
      }

      const updated = replaceManagedBlock(source, NAV_START, NAV_END, lines.join('\n'))
      if (writeIfChanged(file, updated)) changed += 1
    })
  }

  return changed
}

function stripCode(source) {
  const output = []
  let fence = null

  for (const line of source.split('\n')) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (match) {
      const marker = match[1]
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      output.push('')
      continue
    }

    output.push(fence ? '' : line.replace(/`[^`\n]*`/g, ''))
  }

  return output.join('\n')
}

function decodePath(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function resolveWikiTarget(sourceFile, rawTarget, vaultFiles) {
  const filePart = rawTarget.split('#')[0].split('^')[0].trim()
  if (!filePart) return sourceFile

  const decoded = decodePath(filePart).replace(/^\//, '')
  const sourceDirectory = path.posix.dirname(sourceFile)
  const relativeDirectory = sourceDirectory === '.' ? '' : sourceDirectory
  const variants = [decoded, `${decoded}.md`]
  const exact = new Set(vaultFiles)

  for (const variant of variants) {
    const rootCandidate = path.posix.normalize(variant)
    const relativeCandidate = path.posix.normalize(path.posix.join(relativeDirectory, variant))
    if (exact.has(rootCandidate)) return rootCandidate
    if (exact.has(relativeCandidate)) return relativeCandidate
  }

  for (const variant of variants) {
    const targetBase = path.posix.basename(variant)
    const matches = vaultFiles.filter((file) => path.posix.basename(file) === targetBase)
    if (matches.length === 1) return matches[0]
  }
  return null
}

function resolveMarkdownAsset(sourceFile, rawTarget, vaultFiles) {
  let target = rawTarget.trim()
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
  target = target.replace(/\s+["'][^"']*["']$/, '')
  if (/^(?:https?:|data:|mailto:|#)/i.test(target)) return 'external'

  const decoded = decodePath(target)
  const sourceDirectory = path.posix.dirname(sourceFile)
  const relativeDirectory = sourceDirectory === '.' ? '' : sourceDirectory
  const candidate = decoded.startsWith('/')
    ? decoded.slice(1)
    : path.posix.normalize(path.posix.join(relativeDirectory, decoded))

  return vaultFiles.includes(candidate) ? candidate : null
}

function validateVault(markdownFiles) {
  const vaultFiles = listVaultFiles()
  const markdownSet = new Set(markdownFiles)
  const incoming = new Map(markdownFiles.map((file) => [file, 0]))
  const outgoing = new Map(markdownFiles.map((file) => [file, new Set()]))
  const referencedAssets = new Set()
  const brokenWikiLinks = []
  const missingAttachments = []
  const unclosedCodeFences = []
  let wikiLinks = 0
  let attachmentReferences = 0

  for (const file of markdownFiles) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8')
    const searchable = stripCode(source)
    const wikiPattern = /!?\[\[([^\]]+)\]\]/g
    const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g
    let match

    while ((match = wikiPattern.exec(searchable))) {
      wikiLinks += 1
      const rawTarget = match[1].split('|')[0].trim()
      const resolved = resolveWikiTarget(file, rawTarget, vaultFiles)

      if (!resolved) {
        brokenWikiLinks.push(`${file} -> ${rawTarget}`)
      } else if (markdownSet.has(resolved)) {
        incoming.set(resolved, incoming.get(resolved) + 1)
        outgoing.get(file).add(resolved)
      } else {
        referencedAssets.add(resolved)
      }
    }

    while ((match = imagePattern.exec(searchable))) {
      attachmentReferences += 1
      const resolved = resolveMarkdownAsset(file, match[1], vaultFiles)
      if (!resolved) missingAttachments.push(`${file} -> ${match[1]}`)
      else if (resolved !== 'external') referencedAssets.add(resolved)
    }

    const fenceCount = source
      .split('\n')
      .filter((line) => /^\s{0,3}(?:`{3,}|~{3,})/.test(line))
      .length
    if (fenceCount % 2 !== 0) unclosedCodeFences.push(file)
  }

  const orphanNotes = markdownFiles.filter((file) => file !== specialIndexes.get('') && incoming.get(file) === 0)
  const isolatedNotes = markdownFiles.filter((file) => incoming.get(file) === 0 && outgoing.get(file).size === 0)
  const adjacency = new Map(markdownFiles.map((file) => [file, new Set(outgoing.get(file))]))

  for (const [source, targets] of outgoing) {
    for (const target of targets) adjacency.get(target).add(source)
  }

  const visited = new Set()
  const queue = [specialIndexes.get('')]
  while (queue.length) {
    const current = queue.shift()
    if (!current || visited.has(current)) continue
    visited.add(current)
    for (const target of adjacency.get(current) ?? []) queue.push(target)
  }

  const unreachableNotes = markdownFiles.filter((file) => !visited.has(file))
  const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
  const attachments = vaultFiles.filter((file) => imageExtensions.has(path.posix.extname(file).toLowerCase()))
  const unreferencedAttachments = attachments.filter((file) => !referencedAssets.has(file))

  const details = {
    brokenWikiLinks,
    orphanNotes,
    isolatedNotes,
    unreachableNotes,
    unclosedCodeFences,
    missingAttachments,
    unreferencedAttachments,
  }
  const summary = {
    wikiLinks,
    brokenWikiLinks: brokenWikiLinks.length,
    orphanNotes: orphanNotes.length,
    isolatedNotes: isolatedNotes.length,
    unreachableNotes: unreachableNotes.length,
    unclosedCodeFences: unclosedCodeFences.length,
    attachmentReferences,
    missingAttachments: missingAttachments.length,
    unreferencedAttachments: unreferencedAttachments.length,
  }

  return { summary, details }
}

function main() {
  const initialFiles = listMarkdownFiles()
  const directories = contentDirectories(initialFiles)
  const indexesChanged = createGenericIndexes(initialFiles, directories)
  const files = listMarkdownFiles()

  let mapsChanged = 0
  for (const [directory, specialIndex] of specialIndexes) {
    if (updateSpecialIndex(specialIndex, directory, files, directories)) mapsChanged += 1
  }

  const notesChanged = updateNoteNavigations(files)
  const validation = validateVault(files)
  console.log(JSON.stringify({
    markdownFiles: files.length,
    directories: directories.size,
    indexesChanged,
    mapsChanged,
    notesChanged,
    validation: validation.summary,
  }, null, 2))

  const hasErrors = [
    validation.details.brokenWikiLinks,
    validation.details.orphanNotes,
    validation.details.isolatedNotes,
    validation.details.unreachableNotes,
    validation.details.unclosedCodeFences,
    validation.details.missingAttachments,
    validation.details.unreferencedAttachments,
  ].some((items) => items.length)

  if (hasErrors) {
    for (const [name, items] of Object.entries(validation.details)) {
      if (items.length) console.error(`${name}:\n- ${items.join('\n- ')}`)
    }
    process.exitCode = 1
  }
}

main()
