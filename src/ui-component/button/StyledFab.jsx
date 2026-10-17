import { alpha, styled } from '@mui/material/styles'
import { Fab } from '@mui/material'

// NEXORA FAB — replaces darken-hack hover with token-driven states.
export const StyledFab = styled(Fab)(({ theme, color = 'primary' }) => {
    const palette = theme.palette[color] || theme.palette.primary
    const cs = theme.customShadows || {}
    const dur = theme.transitions?.duration?.short || 200
    const ease = theme.transitions?.easing?.easeOut || 'cubic-bezier(0.4, 0, 0.2, 1)'
    return {
        color: '#fff',
        backgroundColor: palette.main,
        boxShadow: cs.sm || 'none',
        transition: `background-color ${dur}ms ${ease}, box-shadow ${dur}ms ${ease}, transform ${dur}ms ${ease}`,
        '&:hover': {
            backgroundColor: palette.dark || palette.main,
            boxShadow: cs.md || cs.sm
        },
        '&:active': {
            transform: 'translateY(1px) scale(0.98)'
        },
        '&:focus-visible': {
            outline: 'none',
            boxShadow: `${cs.focusRing || `0 0 0 3px ${alpha(palette.main, 0.35)}`}, ${cs.sm || '0 2px 4px rgba(0,0,0,0.06)'}`
        }
    }
})
