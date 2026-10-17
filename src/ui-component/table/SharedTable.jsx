import PropTypes from 'prop-types'

// material-ui
import { alpha, styled } from '@mui/material/styles'
import { Box, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell'

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

// ------- StatusDot -------
// 8px dot for status columns. `tone` maps to spectrum. Pair with a text label for A11y.
export const StatusDot = ({ tone = 'teal', size = 8, pulse = false, ...others }) => (
    <Box
        component='span'
        aria-hidden
        sx={(theme) => ({
            display: 'inline-block',
            width: size,
            height: size,
            borderRadius: '50%',
            bgcolor: theme.palette.spectrum?.[tone]?.main || theme.palette.text.disabled,
            flexShrink: 0,
            ...(pulse && {
                boxShadow: `0 0 0 0 ${alpha(theme.palette.spectrum?.[tone]?.main || '#000', 0.5)}`,
                animation: 'gtech-pulse 1.6s ease-out infinite'
            }),
            '@keyframes gtech-pulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.spectrum?.[tone]?.main || '#000', 0.45)}` },
                '70%': { boxShadow: `0 0 0 8px ${alpha(theme.palette.spectrum?.[tone]?.main || '#000', 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.spectrum?.[tone]?.main || '#000', 0)}` }
            }
        })}
        {...others}
    />
)

StatusDot.propTypes = {
    tone: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
    size: PropTypes.number,
    pulse: PropTypes.bool
}

// ------- StatusPill -------
// Compact pill for status columns. Text is required (never icon-only for A11y).
export const StatusPill = ({ tone = 'teal', label, sx: sxProp = {}, ...others }) => (
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
        <StatusDot tone={tone} size={6} />
        {label}
    </Box>
)

StatusPill.propTypes = {
    tone: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
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
