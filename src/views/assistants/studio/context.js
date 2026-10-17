import { createContext } from 'react'

// doc (settings/variables/apis), registry (tokens), stores, issues by node, run highlight
export const StudioContext = createContext({ doc: null, registry: null, stores: [], issues: {}, run: { active: null, path: [] } })
