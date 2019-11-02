import fs from 'fs'
import fleece from 'golden-fleece'
import marked from 'marked'
import PrismJS from 'prismjs'
import 'prismjs/components/prism-bash'

export function extract_frontmatter(markdown) {
  const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown)
  const frontMatter = match[1]
  const content = markdown.slice(match[0].length)

  const metadata = {}
  frontMatter.split('\n').forEach(pair => {
    const colonIndex = pair.indexOf(':')
    metadata[pair.slice(0, colonIndex).trim()] = pair
      .slice(colonIndex + 1)
      .trim()
  })

  return { metadata, content }
}

export function extract_metadata(line, lang) {
  try {
    if (lang === 'html' && line.startsWith('<!--') && line.endsWith('-->')) {
      return fleece.evaluate(line.slice(4, -3).trim())
    }

    if (
      lang === 'js' ||
      (lang === 'json' && line.startsWith('/*') && line.endsWith('*/'))
    ) {
      return fleece.evaluate(line.slice(2, -2).trim())
    }
  } catch (err) {
    // TODO report these errors, don't just squelch them
    return null
  }
}

// map lang to prism-language-attr
export const langs = {
  bash: 'bash',
  html: 'markup',
  js: 'javascript',
  css: 'css',
}

const escaped = {
  '"': '&quot;',
  "'": '&#39;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}

const unescaped = Object.keys(escaped).reduce(
  (unescaped, key) => ((unescaped[escaped[key]] = key), unescaped),
  {}
)

function unescape(str) {
  return String(str).replace(/&.+?;/g, match => unescaped[match] || match)
}

export function parse_markdown(source_dir, file) {
  const { length, [length - 1]: anchor_base_url } = source_dir.split('/')

  const markdown = fs.readFileSync(`${source_dir}/${file}`, 'utf-8')
  const { content, metadata } = extract_frontmatter(markdown)

  const subsections = []
  const renderer = new marked.Renderer()

  renderer.code = (source, lang) => {
    source = source.replace(/^ +/gm, match => match.split('  ').join('\t'))

    const lines = source.split('\n')
    const meta = extract_metadata(lines[0], lang)

    let prefix = ''
    let className = 'code-block'

    if (meta) {
      source = lines.slice(1).join('\n')
      const filename = meta.filename
      if (filename) {
        prefix = `<span class='filename'>${prefix} ${filename}</span>`
        className += ' named'
      }
      if (meta.hidden) return ''
    }

    const plang = langs[lang]
    const highlighted = PrismJS.highlight(
      source,
      PrismJS.languages[plang],
      lang
    )

    const html = `<div class='${className}'>${prefix}<pre class='language-${plang}'><code>${highlighted}</code></pre></div>`

    // Not sure if I need this
    // if (block_open) {
    //   block_open = false
    //   return `</div><div class="code">${html}</div></div>`
    // }

    return html
  }

  const seen = new Set()

  renderer.heading = (text, level, rawtext) => {
    if (level <= 3) {
      const pathname = `${anchor_base_url}/${file
        .replace(/^\d+-/, '')
        .replace(/\.md$/, '')}`

      const section_slug = rawtext
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-/, '')
        .replace(/-$/, '')

      if (seen.has(section_slug)) {
        throw new Error(`Duplicate section_slug ${section_slug}`)
      }

      seen.add(section_slug)

      if (level === 3) {
        const title = unescape(
          text
            .replace(/<\/?code>/g, '')
            .replace(/\.(\w+)(\((.+)?\))?/, (m, $1, $2, $3) => {
              if ($3) return `.${$1}(...)`
              if ($2) return `.${$1}()`
              return `.${$1}`
            })
        )

        subsections.push({ section_slug, title })
      }

      return `
        <h${level}>
          <span id="${section_slug}" class="offset-anchor" ${
        level > 4 ? 'data-scrollignore' : ''
      }></span>
          <a href="${pathname}#${section_slug}" class="anchor" aria-hidden="true"></a>
          ${text}
        </h${level}>`
    }

    return `<h${level}>${text}</h${level}>`
  }

  const html = marked(content, { renderer })

  const parsed_markdown = {
    file,
    metadata: JSON.stringify(metadata),
    slug: `${anchor_base_url}/${file
      .replace(/^\d+-/, '')
      .replace(/\.md$/, '')}`,
    content: html,
  }

  return parsed_markdown
}
