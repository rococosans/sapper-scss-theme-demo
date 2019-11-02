import fs from 'fs'
import path from 'path'
import { parse_markdown } from '../utils/markdown.js'

export default {
  Query: {
    async filesByDirectory(_, { input }, ctx, info) {
      const { source_dir, ext_type = '.md' } = input

      const filesObjArr = fs
        .readdirSync(source_dir)
        .filter(file => file[0] !== '.' && path.extname(file) === ext_type)
        .map(file => {
          switch (ext_type) {
            case '.md':
              return parse_markdown(source_dir, file)
            default:
              return 'This function currently only supports ".md" files'
          }
        })

      return filesObjArr
    },

    async fileBySlug(_, { input }, ctx, info) {
      const { source_dir, slug, ext_type = '.md' } = input

      // Handles cases where slug is passed as a file name directly
      // should be broken off into separate query
      let normalized_file_name = slug

      if (slug.split('/').length > 0) {
        const { length, [length - 1]: slug_str } = slug.split('/')
        normalized_file_name = `${slug_str}${ext_type}`
      }

      const [file] = fs
        .readdirSync(source_dir)
        .filter(
          file =>
            file[0] !== '.' &&
            file === normalized_file_name &&
            path.extname(file) === ext_type
        )

      if (!file) {
        throw new Error('Error: No file matches that slug')
      }

      switch (ext_type) {
        case '.md':
          return parse_markdown(source_dir, file)
        default:
          return 'This function currently only supports ".md" files'
      }
    },
  },
}
