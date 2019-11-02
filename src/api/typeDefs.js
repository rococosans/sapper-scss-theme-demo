import path from 'path'
import fs from 'fs'

//! Error: ENOENT: no such file or directory, open 'C:\...\project-dir\__sapper__\dev\server\base\schema_Base.graphql'
// const dotDotSlashes = './'

// This is a fix for the above
const dotDotSlashes = '../../../src/api'

const loadGQLFile = type => {
  const filePath = path.join(__dirname, dotDotSlashes, type)
  return fs.readFileSync(filePath, 'utf-8')
}

const typeDefs = [loadGQLFile('base/schema_Base.graphql')]

export default typeDefs
