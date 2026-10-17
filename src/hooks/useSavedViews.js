import { useCallback, useEffect, useState } from 'react'

const useSavedViews = (key, defaults = []) => {
    const [views, setViews] = useState(() => {
        try {
            const raw = localStorage.getItem(key)
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) return parsed
            }
        } catch (_) {
            /* noop */
        }
        return defaults
    })

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(views))
        } catch (_) {
            /* noop */
        }
    }, [key, views])

    const saveView = useCallback((name, payload) => {
        setViews((prev) => {
            const exists = prev.find((v) => v.name === name)
            if (exists) return prev.map((v) => (v.name === name ? { name, payload } : v))
            return [...prev, { name, payload }]
        })
    }, [])

    const deleteView = useCallback((name) => {
        setViews((prev) => prev.filter((v) => v.name !== name))
    }, [])

    return { views, saveView, deleteView }
}

export default useSavedViews
