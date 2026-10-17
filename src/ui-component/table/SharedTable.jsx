import PropTypes from 'prop-types'

// material-ui
import { alpha, styled } from '@mui/material/styles'
import { Box, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell'

import { AppIcon } from '@/ui-component/icons/AppIcon'

// ==============================|| SHARED NEXORA TABLE PRIMITIVES ||============================== //
// One system used by every NEXORA view (customers, employees, prism, configuration, omnichannel).
// Replaces the ~20 duplicated local StyledTableCell copies that hard-coded `grey[900] + '25'`
// (a broken hex string concat). All borders / hover / header styling read from tokens.
//
// Rules:
//   - Header: 12px uppercase caption, +0.06em letter-spacing, subtle bg, 44px rows
//   - Body cells: body2 (14px), 44px min-height rows, divider = alpha.divider
//   - Numeric columns: pass numeric prop → tabular-nums, right-aligned
//   - No caption text under column headers (project rule)
//   - Row hover: alpha.hover; row focus-visible: focusRing
//
// Does NOT replace Nexora core `TableStyles.jsx` (chatflows/agentflows still use those).

// ------- SharedTableCell -------
// Prop: `numeric` (boolean) — right-align + tabular-nums for money/count columns.
export const SharedTableCell = styled(TableCell, {
    shouldForwardProp: (prop) => prop !== 'numeric'
})(({ theme, numeric }) => ({
    borderColor: theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06),
    padding: '10px 16px',
    ...(numeric && {
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums'
    }),
    [`&.${tableCellClasses.head}`]: {
        color: theme.palette.text.secondary,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: theme.palette.alpha?.hover || alpha(theme.palette.text.primary, 0.03),
        borderBottom: `1px solid ${theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)}`,
        padding: '10px 16px',
        height: 44,
        whiteSpace: 'nowrap'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: theme.palette.text.primary,
        lineHeight: 1.5
    }
}))

// ------- SharedTableRow -------
// Prop: `interactive` (boolean) — pointer cursor + hover surface + focus ring.
export const SharedTableRow = styled(TableRow, {
    shouldForwardProp: (prop) => prop !== 'interactive'
})(({ theme, interactive }) => ({
    transition: `background-color ${theme.transitions?.duration?.short || 200}ms ${
        theme.transitions?.easing?.easeOut || 'cubic-bezier(0.4, 0, 0.2, 1)'
    }`,
    ...(interactive && {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.alpha?.hover || alpha(theme.palette.text.primary, 0.03)
        },
        '&:focus-visible': {
            outline: 'none',
            boxShadow: theme.customShadows?.focusRing,
            position: 'relative',
            zIndex: 1
        }
    }),
    // Hide last row divider — cleaner card edge
    '&:last-child td, &:last-child th': {
        borderBottom: 0
    }
}))

// ------- SharedTableContainer -------
// Wraps <Table> with the standard hairline border + radius so views don't repeat this.
export const SharedTableContainer = styled(TableContainer)(({ theme }) => ({
    border: `1px solid ${theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)}`,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.customShadows?.xs
}))

// ------- StatusIcon -------
// Status marker for tables, chips and lists: a filled glyph that names the state, tinted by `tone`.
// Never a bare coloured dot (colour alone doesn't say what the state is). Pair with a text label.
// `icon` picks the glyph for the specific state; without it the tone's generic glyph is used.
export const TONE_ICONS = {
    emerald: 'CheckCircle',
    rose: 'XCircle',
    amber: 'WarningCircle',
    orange: 'ArrowCircleRight',
    teal: 'Info'
}

export const StatusIcon = ({ tone = 'teal', icon, size = 14, spin = false, sx: sxProp = {}, ...others }) => (
    <Box
        component='span'
        aria-hidden
        sx={(theme) => ({
            display: 'inline-flex',
            flexShrink: 0,
            color: theme.palette.spectrum?.[tone]?.main || theme.palette.text.disabled,
            ...sxProp
        })}
        {...others}
    >
        <AppIcon name={icon || TONE_ICONS[tone] || 'Info'} size={size} className={spin ? 'spin-animation' : undefined} />
    </Box>
)

StatusIcon.propTypes = {
    tone: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
    icon: PropTypes.string,
    size: PropTypes.number,
    spin: PropTypes.bool,
    sx: PropTypes.object
}

// ------- StatusPill -------
// Compact pill for status columns. Text is required (never icon-only for A11y).
export const StatusPill = ({ tone = 'teal', icon, label, sx: sxProp = {}, ...others }) => (
    <Box
        component='span'
        sx={(theme) => {
            const spec = theme.palette.spectrum?.[tone] || theme.palette.primary
            return {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                height: 22,
                px: 1.25,
                borderRadius: 999,
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: 1,
                bgcolor: alpha(spec.main, theme.palette.mode === 'dark' ? 0.2 : 0.14),
                color: theme.palette.mode === 'dark' ? spec.light : spec.dark,
                whiteSpace: 'nowrap',
                ...sxProp
            }
        }}
        {...others}
    >
        <StatusIcon tone={tone} icon={icon} size={12} />
        {label}
    </Box>
)

StatusPill.propTypes = {
    tone: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
    icon: PropTypes.string,
    label: PropTypes.node,
    sx: PropTypes.object
}

// ------- Numeric text helper -------
// Big tabular figure used in KPI cells. Use inside a SharedTableCell numeric.
export const NumericText = ({ value, suffix, sx: sxProp = {} }) => (
    <Typography
        component='span'
        sx={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            fontSize: '0.9375rem',
            ...sxProp
        }}
    >
        {value}
        {suffix && (
            <Typography component='span' sx={{ ml: 0.25, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
                {suffix}
            </Typography>
        )}
    </Typography>
)

NumericText.propTypes = {
    value: PropTypes.node,
    suffix: PropTypes.node,
    sx: PropTypes.object
}
