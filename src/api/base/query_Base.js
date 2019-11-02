import fs from 'fs'
import path from 'path'
import marked from 'marked'
import PrismJS from 'prismjs'
import 'prismjs/components/prism-bash'
import {
  extract_frontmatter,
  extract_metadata,
  langs,
} from '../utils/markdown.js'

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

export default {
  Query: {
    async get_files(_, { input }, ctx, info) {
      const { source_dir, anchor_base_url } = input

      const filesObjArr = fs
        .readdirSync(source_dir)
        .filter(file => file[0] !== '.' && path.extname(file) === '.md')
        .map(file => {
          const markdown = fs.readFileSync(`${source_dir}/${file}`, 'utf-8')
          const { content, metadata } = extract_frontmatter(markdown)

          const subsections = []
          const renderer = new marked.Renderer()

          renderer.code = (source, lang) => {
            source = source.replace(/^ +/gm, match =>
              match.split('  ').join('\t')
            )

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
              const slug = rawtext
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .replace(/^-/, '')
                .replace(/-$/, '')

              if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`)
              seen.add(slug)

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

                subsections.push({ slug, title })
              }

              return `
                <h${level}>
                  <span id="${slug}" class="offset-anchor" ${
                level > 4 ? 'data-scrollignore' : ''
              }></span>
                  <a href="${anchor_base_url}#${slug}" class="anchor" aria-hidden="true"></a>
                  ${text}
                </h${level}>`
            }

            return `<h${level}>${text}</h${level}>`
          }

          const html = marked(content, { renderer })

          return {
            metadata: JSON.stringify(metadata),
            file,
            slug: `${anchor_base_url}/${file
              .replace(/^\d+-/, '')
              .replace(/\.md$/, '')}`,
            content: html,
          }
        })

      return filesObjArr
    },
  },
}
