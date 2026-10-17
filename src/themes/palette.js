// NEXORA palette — see DESIGN_DECISIONS.md
// Extends MUI palette with alpha, surface and accent tokens fed from _themes-vars.module.scss.
// Legacy `card`, `textBackground`, `asyncSelect`, `timeMessage`, `canvasHeader`, `codeEditor`,
// `nodeToolTip` are kept intact for Nexora canvas/chatmessage backward compat.

export default function themePalette(theme) {
    const isDark = theme.customization.isDarkMode
    const c = theme.colors || {}

    return {
        // MUI derives action/hover/disabled colours and component defaults from this — must match the real mode
        mode: isDark ? 'dark' : 'light',
        divider: theme.divider,
        transparent: c.transparent,
        common: {
            black: c.darkPaper,
            dark: c.darkPrimaryMain
        },
        primary: {
            light: isDark ? c.darkPrimaryLight : c.primaryLight,
            main: c.primaryMain,
            dark: isDark ? c.darkPrimaryDark : c.primaryDark,
            200: isDark ? c.darkPrimary200 : c.primary200,
            800: isDark ? c.darkPrimary800 : c.primary800
        },
        secondary: {
            light: isDark ? c.darkSecondaryLight : c.secondaryLight,
            main: isDark ? c.darkSecondaryMain : c.secondaryMain,
            dark: isDark ? c.darkSecondaryDark : c.secondaryDark,
            200: c.secondary200,
            800: c.secondary800
        },
        error: {
            light: c.errorLight,
            main: c.errorMain,
            dark: c.errorDark
        },
        orange: {
            light: c.orangeLight,
            main: c.orangeMain,
            dark: c.orangeDark
        },
        teal: {
            light: c.tealLight,
            main: c.tealMain,
            dark: c.tealDark
        },
        warning: {
            light: c.warningLight,
            main: c.warningMain,
            dark: c.warningDark
        },
        success: {
            light: c.successLight,
            200: c.success200,
            main: c.successMain,
            dark: c.successDark
        },
        grey: {
            50: c.grey50,
            100: c.grey100,
            200: c.grey200,
            300: c.grey300,
            500: theme.darkTextSecondary,
            600: theme.heading,
            700: theme.darkTextPrimary,
            900: theme.textDark
        },
        dark: {
            light: c.darkTextPrimary,
            main: c.darkLevel1,
            dark: c.darkLevel2,
            800: c.darkBackground,
            900: c.darkPaper
        },
        text: {
            primary: theme.darkTextPrimary,
            secondary: theme.darkTextSecondary,
            dark: theme.textDark,
            hint: c.grey100
        },
        background: {
            paper: theme.paper,
            default: theme.backgroundDefault
        },

        // Semantic NEXORA tokens (Hybrid A+B) — use these in new code
        // Alpha-based borders/dividers/hovers — replaces `grey[900] + '25'` string-concat bug
        alpha: {
            border: isDark ? c.darkAlphaBorder : c.alphaBorder,
            borderStrong: isDark ? c.darkAlphaBorderStrong : c.alphaBorderStrong,
            divider: isDark ? c.darkAlphaDivider : c.alphaDivider,
            hover: isDark ? c.darkAlphaHover : c.alphaHover,
            overlay: isDark ? c.darkAlphaOverlay : c.alphaOverlay
        },
        surface: {
            main: isDark ? c.darkSurface : c.surface,
            raised: isDark ? c.darkSurfaceRaised : c.surfaceRaised,
            sunken: isDark ? c.darkSurfaceSunken : c.surfaceSunken
        },
        // @deprecated — retired in unified surface. Do NOT use for new decorative backgrounds.
        accent: {
            soft: c.accentSoft,
            medium: c.accentMedium,
            strong: c.accentStrong
        },

        // ===== SPECTRUM (2026 identity) =====
        // Semantic hue map: same hue = same meaning across every screen.
        //   rose    → negative / needs-attention / expiry / destructive
        //   orange  → brand primary (NEXORA Blue) / active / selected
        //   amber   → warning / pending / in-progress
        //   emerald → success / resolved / approved / online
        //   teal    → NEXORA Cyan: neutral-live / info / in-flight (chat, automation running)
        // Alias-only: reuses existing color scales, no duplicate hex.
        spectrum: {
            rose: { light: c.errorLight, main: c.errorMain, dark: c.errorDark },
            orange: { light: c.primaryLight, main: c.primaryMain, dark: c.primaryDark },
            amber: { light: c.warningLight, main: c.warningMain, dark: c.warningDark },
            emerald: { light: c.successLight, main: c.successMain, dark: c.successDark },
            teal: { light: c.tealLight, main: c.tealMain, dark: c.tealDark }
        },

        // === LEGACY Nexora tokens — kept for canvas/chatmessage compat ===
        textBackground: {
            main: isDark ? c.darkPrimary800 : c.grey50,
            border: isDark ? c.transparent : c.grey400
        },
        card: {
            main: isDark ? c.darkPrimaryMain : c.paper,
            light: isDark ? c.darkPrimary200 : c.paper,
            hover: isDark ? c.darkPrimary800 : c.paper
        },
        asyncSelect: {
            main: isDark ? c.darkPrimary800 : c.grey50
        },
        timeMessage: {
            main: isDark ? c.darkLevel2 : c.grey200
        },
        canvasHeader: {
            deployLight: c.primaryLight,
            deployDark: c.primaryDark,
            saveLight: c.secondaryLight,
            saveDark: c.secondaryDark,
            settingsLight: c.grey300,
            settingsDark: c.grey700
        },
        codeEditor: {
            main: isDark ? c.darkPrimary800 : c.primaryLight
        },
        nodeToolTip: {
            background: isDark ? c.darkPrimary800 : c.paper,
            color: isDark ? c.paper : 'rgba(0, 0, 0, 0.87)'
        }
    }
}
