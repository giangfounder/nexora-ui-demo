import { useSearchParams } from 'react-router-dom'

// Sync a numeric tab index with a URL query param so tabs deep-link and the
// browser back button flips between them. Pass the same tab keys (in tab-index
// order) that you want to appear in the URL — e.g. ['list', 'atlas'].
// When index is 0 the param is removed (clean URL for the default tab).
const useUrlTabState = (paramName, keys) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const raw = searchParams.get(paramName)
    const found = keys.indexOf(raw)
    const tab = found >= 0 ? found : 0
    const setTab = (v) => {
        const next = new URLSearchParams(searchParams)
        if (v > 0 && keys[v]) next.set(paramName, keys[v])
        else next.delete(paramName)
        setSearchParams(next, { replace: true })
    }
    return [tab, setTab]
}

export default useUrlTabState
