import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, StyledEngineProvider } from '@mui/material'

// routing
import Routes from '@/routes'

// defaultTheme
import themes from '@/themes'

// project imports
import NavigationScroll from '@/layout/NavigationScroll'
import { SET_THEME_MODE } from '@/store/actions'
import { applyDocumentTheme } from '@/store/themeMode'

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const { themeMode, isDarkMode } = customization

    useEffect(() => applyDocumentTheme(isDarkMode), [isDarkMode])

    // 'system' follows the OS live (e.g. macOS auto dark at sunset)
    useEffect(() => {
        if (themeMode !== 'system' || !window.matchMedia) return undefined
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => dispatch({ type: SET_THEME_MODE, themeMode: 'system', persist: false })
        mq.addEventListener?.('change', onChange)
        return () => mq.removeEventListener?.('change', onChange)
    }, [themeMode, dispatch])

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <Routes />
                </NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default App
