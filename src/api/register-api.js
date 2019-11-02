import { merge } from 'lodash'

// Import Mutation
import BaseMutation from './base/mutation_Base'

// Import Query
import BaseQuery from './base/query_Base'

// Merge Mutation
const mutations = merge(BaseMutation)

// Merge Query
const queries = merge(BaseQuery)

// Merge Resolvers
const resolvers = merge(queries, mutations)

export default resolvers
