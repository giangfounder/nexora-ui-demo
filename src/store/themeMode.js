// Theme preference: 'light' | 'dark' | 'system'. The resolved boolean still lives in
// customization.isDarkMode so existing code keeps working; 'system' follows the OS setting live.
export const THEME_MODE_KEY = 'nexoraThemeMode'
export const THEME_MODES = ['light', 'dark', 'system']

const systemPrefersDark = () => {
    try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
        return false
    }
}

export const readThemeMode = () => {
    try {
        const stored = localStorage.getItem(THEME_MODE_KEY)
        if (THEME_MODES.includes(stored)) return stored
        // migrate the old on/off flag
        const legacy = localStorage.getItem('isDarkMode')
        if (legacy === 'true') return 'dark'
        if (legacy === 'false') return 'light'
    } catch (e) {
        // storage unavailable
    }
    return 'system'
}

export const saveThemeMode = (mode) => {
    try {
        localStorage.setItem(THEME_MODE_KEY, mode)
        localStorage.setItem('isDarkMode', String(resolveDark(mode)))
    } catch (e) {
        // storage unavailable
    }
}

export const resolveDark = (mode) => (mode === 'system' ? systemPrefersDark() : mode === 'dark')

// Keep <html> in step so native controls, scrollbars and the pre-React background match.
export const applyDocumentTheme = (isDark) => {
    const el = document.documentElement
    el.dataset.theme = isDark ? 'dark' : 'light'
    el.style.colorScheme = isDark ? 'dark' : 'light'
}
