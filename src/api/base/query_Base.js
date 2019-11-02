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
    async filesByDirectory(_, { input }, ctx, info) {
      const { source_dir, ext_type = '.md' } = input
      const { length, [length - 1]: anchor_base_url } = source_dir.split('/')

      const filesObjArr = fs
        .readdirSync(source_dir)
        .filter(file => file[0] !== '.' && path.extname(file) === ext_type)
        .map(file => {
          // parse markdown file start
          // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
            metadata: JSON.stringify(metadata),
            file,
            slug: `${anchor_base_url}/${file
              .replace(/^\d+-/, '')
              .replace(/\.md$/, '')}`,
            content: html,
          }

          // parse markdown file end
          // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

          return parsed_markdown
        })
      return filesObjArr
    },

    async fileByName() {
      return {
        file: '2019-02-28-svelte-goes-native.md',
        metadata:
          '{"title":"Svelte Goes Native","description":"Svelte comes to NativeScript","pubdate":"2019-02-28","author":"Halfnelson","authorURL":"https://twitter.com/halfnelson_au/"}',
        slug: 'blog/02-28-svelte-goes-native',
        content:
          '<p>Svelte is a next gen web framework that compiles your component code into fa',
      }
    },
  },
}
