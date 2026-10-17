// NEXORA typography scale — see DESIGN_DECISIONS.md
// Base 15px body, display headline scale with real hierarchy (was 12→34, flat).
// Weight range 400/500/600/700 used consistently across scale.

// NEXORA: Space Grotesk for display/brand headings, Inter for UI/body.
const DISPLAY_FONT = `'Space Grotesk', 'Inter', 'Roboto', 'Arial', sans-serif`

export default function themeTypography(theme) {
    return {
        fontFamily: theme?.customization?.fontFamily,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightSemiBold: 600,
        fontWeightBold: 700,

        // Display — hero moments only (empty state hero, big stat, splash)
        display: {
            fontFamily: DISPLAY_FONT,
            fontSize: '3rem',
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: theme.heading
        },
        h1: {
            fontFamily: DISPLAY_FONT,
            fontSize: '1.75rem', // 28px page title
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: theme.heading
        },
        h2: {
            fontFamily: DISPLAY_FONT,
            fontSize: '1.25rem', // 20px section title
            lineHeight: 1.3,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: theme.heading
        },
        h3: {
            fontSize: '1.125rem', // 18px card title
            lineHeight: 1.4,
            fontWeight: 600,
            color: theme.heading
        },
        h4: {
            fontSize: '1rem', // 16px
            lineHeight: 1.5,
            fontWeight: 600,
            color: theme.heading
        },
        h5: {
            fontSize: '0.875rem', // 14px
            lineHeight: 1.5,
            fontWeight: 600,
            color: theme.heading
        },
        // h6 = eyebrow ONLY. Rationed: max 1 per 3 sections.
        h6: {
            fontSize: '0.6875rem', // 11px
            lineHeight: 1.4,
            fontWeight: 700,
            color: theme.darkTextSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
        },
        subtitle1: {
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: theme.textDark
        },
        subtitle2: {
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: theme.darkTextSecondary
        },
        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.4,
            color: theme.darkTextSecondary,
            fontWeight: 400
        },
        body1: {
            fontSize: '0.9375rem',
            fontWeight: 400,
            lineHeight: 1.55,
            color: theme.darkTextPrimary
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.55,
            color: theme.darkTextPrimary
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0em'
        },

        // === Chrome roles — each has its own size/weight so they read apart at a glance ===
        // Main menu (top nav groups): largest chrome text.
        navItem: {
            fontSize: '0.9375rem', // 15px
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.005em'
        },
        // Tabs / sub-navigation / segmented filters.
        tabItem: {
            fontSize: '0.875rem', // 14px
            fontWeight: 500,
            lineHeight: 1.25
        },
        // Form field labels: small but solid, darker than the value text and placeholder.
        fieldLabel: {
            fontSize: '0.8125rem', // 13px
            fontWeight: 600,
            lineHeight: 1.4,
            color: theme.heading
        },
        // Group headings inside menus / tab bars.
        eyebrow: {
            fontSize: '0.6875rem', // 11px
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.darkTextSecondary
        },
        // Numeric display — for KPIs, scoreboards, counts
        displayNumber: {
            fontSize: '2rem',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum", "ss01"',
            color: theme.heading
        },
        numeric: {
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"'
        },

        // === LEGACY tokens kept for backward compat ===
        customInput: {
            marginTop: 1,
            marginBottom: 1,
            '& > label': {
                top: 23,
                left: 0,
                color: theme.grey500,
                '&[data-shrink="false"]': { top: 5 }
            },
            '& > div > input': {
                padding: '30.5px 14px 11.5px !important'
            },
            '& legend': { display: 'none' },
            '& fieldset': { top: 0 }
        },
        mainContent: {
            backgroundColor: theme.background,
            width: '100%',
            minHeight: 'calc(100vh - 75px)',
            flexGrow: 1,
            padding: '20px',
            marginTop: '75px',
            marginRight: '20px',
            borderRadius: `${theme?.customization?.borderRadius}px`
        },
        menuCaption: {
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: theme.heading,
            padding: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginTop: '10px'
        },
        subMenuCaption: {
            fontSize: '0.75rem',
            fontWeight: 500,
            color: theme.darkTextSecondary,
            textTransform: 'capitalize'
        },
        commonAvatar: {
            cursor: 'pointer',
            borderRadius: '6px'
        },
        smallAvatar: {
            width: '22px',
            height: '22px',
            fontSize: '1rem'
        },
        mediumAvatar: {
            width: '34px',
            height: '34px',
            fontSize: '1.2rem'
        },
        largeAvatar: {
            width: '44px',
            height: '44px',
            fontSize: '1.5rem'
        }
    }
}
