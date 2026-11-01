import { createTheme } from '@mui/material/styles'

// assets
import colors from '@/assets/scss/_themes-vars.module.scss'

// project imports
import componentStyleOverrides from './compStyleOverride'
import themePalette from './palette'
import themeTypography from './typography'
import customShadows from './customShadows'
import { duration, easing } from './motion'

/**
 * NEXORA theme (Hybrid A+B direction) — see DESIGN_DECISIONS.md
 * @param {JsonObject} customization
 */
export const theme = (customization) => {
    const color = colors
    const isDark = customization.isDarkMode

    const themeOption = isDark
        ? {
              colors: color,
              heading: color.paper,
              paper: color.darkSurfaceRaised,
              backgroundDefault: color.darkPaper,
              background: color.darkSurfaceRaised,
              darkTextPrimary: color.darkTextPrimary,
              darkTextSecondary: color.darkTextSecondary,
              textDark: color.paper,
              // Sidebar active state = brand blue tint (primary)
              menuSelected: color.darkPrimaryDark,
              menuSelectedBack: color.darkPrimaryLight,
              divider: color.darkAlphaBorder,
              customization
          }
        : {
              colors: color,
              heading: color.grey900,
              paper: color.paper,
              backgroundDefault: color.grey100,
              background: color.grey50,
              darkTextPrimary: color.grey700,
              darkTextSecondary: color.grey500,
              textDark: color.grey900,
              // Sidebar active state = brand blue tint (primary)
              menuSelected: color.primaryDark,
              menuSelectedBack: color.primaryLight,
              divider: color.grey200,
              customization
          }

    const themeOptions = {
        direction: 'ltr',
        palette: themePalette(themeOption),
        // 8px grid — MUI default is 8, made explicit for docs
        spacing: 8,
        // Contract: radius scale is 6 (controls) / 10 (panel & card) / 12 (dialog outer) / 9999 (pill only for status/filter-on/avatar).
        // View code MUST NOT override borderRadius with any other value.
        shape: {
            borderRadius: 6
        },
        mixins: {
            toolbar: {
                minHeight: '64px',
                padding: '0 16px',
                '@media (min-width: 600px)': {
                    minHeight: '64px'
                }
            }
        },
        typography: themeTypography(themeOption),
        // Motion tokens exposed via MUI's transitions API + custom keys
        transitions: {
            duration: {
                shortest: duration.fast,
                shorter: duration.fast,
                short: duration.standard,
                standard: duration.standard,
                complex: duration.drawer,
                enteringScreen: duration.drawer,
                leavingScreen: duration.standard
            },
            easing: {
                easeInOut: easing.standard,
                easeOut: easing.standard,
                easeIn: easing.standard,
                sharp: easing.emphasized,
                emphasized: easing.emphasized,
                // @deprecated alias — no bounce in unified surface
                premium: easing.standard
            }
        }
    }

    const themes = createTheme(themeOptions)
    // Attach custom shadow map (in addition to MUI's shadows[0..24]) — access via theme.customShadows
    themes.customShadows = customShadows(isDark)
    themes.components = componentStyleOverrides(themeOption)

    return themes
}

export default theme
