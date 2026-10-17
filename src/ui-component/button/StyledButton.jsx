import { alpha, styled } from '@mui/material/styles'
import { Button } from '@mui/material'
import MuiToggleButton from '@mui/material/ToggleButton'

// NEXORA primary CTA — see DESIGN_DECISIONS.md
// Replaces the darken-hack (`linear-gradient(rgb(0 0 0/10%) 0 0)`) with proper token-based
// hover/active/focus/disabled states.
export const StyledButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'flavor'
})(({ theme, color = 'primary', flavor = 'standard' }) => {
    const palette = theme.palette[color] || theme.palette.primary
    const cs = theme.customShadows || {}
    const dur = theme.transitions?.duration?.short || 200
    const ease = theme.transitions?.easing?.easeOut || 'cubic-bezier(0.4, 0, 0.2, 1)'
    return {
        color: theme.palette.getContrastText ? theme.palette.getContrastText(palette.main) : '#fff',
        backgroundColor: palette.main,
        borderRadius: flavor === 'premium' ? 9999 : theme.shape.borderRadius,
        boxShadow: 'none',
        textTransform: 'none',
        fontWeight: 500,
        minHeight: 36,
        paddingInline: 14,
        transition: `background-color ${dur}ms ${ease}, box-shadow ${dur}ms ${ease}, transform ${dur}ms ${ease}`,
        '&:hover': {
            backgroundColor: palette.dark || palette.main,
            boxShadow: flavor === 'premium' ? cs.warmSm : 'none'
        },
        '&:active': {
            transform: 'translateY(1px)'
        },
        '&:focus-visible': {
            outline: 'none',
            boxShadow: cs.focusRing || `0 0 0 3px ${alpha(palette.main, 0.35)}`
        },
        '&.Mui-disabled': {
            backgroundColor: alpha(palette.main, 0.35),
            color: '#fff'
        }
    }
})

export const StyledToggleButton = styled(MuiToggleButton)(({ theme, color = 'primary' }) => {
    const palette = theme.palette[color] || theme.palette.primary
    return {
        textTransform: 'none',
        '&.Mui-selected, &.Mui-selected:hover': {
            color: '#fff',
            backgroundColor: palette.main
        },
        '&:focus-visible': {
            outline: 'none',
            boxShadow: theme.customShadows?.focusRing || `0 0 0 3px ${alpha(palette.main, 0.35)}`
        }
    }
})
