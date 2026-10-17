import { useRef } from 'react'
import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'

// ==============================|| DASHBOARD — DEPTH PRIMITIVES ||============================== //

// Lighten (amt > 0) or darken (amt < 0) a hex colour — used for the lit / shaded faces of 3D shapes.
export const shade = (hex, amt) => {
    const n = parseInt(hex.replace('#', ''), 16)
    const mix = (c) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
    const r = mix((n >> 16) & 255)
    const g = mix((n >> 8) & 255)
    const b = mix(n & 255)
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// Layered, blue-tinted elevation shared by every dashboard card.
export const useDepth = () => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const brand = theme.palette.primary.main
    return {
        isDark,
        brand,
        hairline: alpha(theme.palette.text.primary, isDark ? 0.1 : 0.07),
        rest: isDark
            ? `inset 0 1px 0 ${alpha('#fff', 0.06)}, 0 1px 2px rgba(0,0,0,0.4), 0 16px 36px -18px rgba(0,0,0,0.7)`
            : `inset 0 1px 0 ${alpha('#fff', 0.8)}, 0 1px 2px rgba(16,24,40,0.05), 0 16px 36px -18px ${alpha(brand, 0.28)}`,
        lifted: isDark
            ? `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 2px 4px rgba(0,0,0,0.4), 0 28px 48px -20px rgba(0,0,0,0.8)`
            : `inset 0 1px 0 ${alpha('#fff', 0.8)}, 0 2px 4px rgba(16,24,40,0.06), 0 28px 48px -20px ${alpha(brand, 0.38)}`
    }
}

// Card with real perspective: tilts toward the pointer and catches a soft highlight.
// Tilt is written straight to CSS variables (no re-render); disabled for touch and reduced motion.
export const Tilt3D = ({ children, max = 6, sx, ...rest }) => {
    const ref = useRef(null)
    const d = useDepth()

    const onMove = (e) => {
        const el = ref.current
        if (!el || e.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--rx', `${(0.5 - py) * max}deg`)
        el.style.setProperty('--ry', `${(px - 0.5) * max}deg`)
        el.style.setProperty('--gx', `${px * 100}%`)
        el.style.setProperty('--gy', `${py * 100}%`)
        el.dataset.tilt = 'on'
    }
    const onLeave = () => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--rx', '0deg')
        el.style.setProperty('--ry', '0deg')
        el.dataset.tilt = 'off'
    }

    return (
        <Box sx={{ perspective: '1100px', height: '100%' }}>
            <Box
                ref={ref}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                {...rest}
                sx={{
                    position: 'relative',
                    height: '100%',
                    borderRadius: '18px',
                    bgcolor: 'background.paper',
                    border: `1px solid ${d.hairline}`,
                    boxShadow: d.rest,
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
                    transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease-out',
                    willChange: 'transform',
                    '&[data-tilt="on"]': { transition: 'transform 80ms linear, box-shadow 300ms ease-out', boxShadow: d.lifted },
                    // soft moving highlight
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        background: `radial-gradient(420px circle at var(--gx, 50%) var(--gy, 0%), ${alpha(
                            '#fff',
                            d.isDark ? 0.06 : 0.5
                        )}, transparent 60%)`,
                        opacity: 0,
                        transition: 'opacity 300ms ease-out'
                    },
                    '&[data-tilt="on"]::after': { opacity: 1 },
                    ...sx
                }}
            >
                {children}
            </Box>
        </Box>
    )
}

Tilt3D.propTypes = { children: PropTypes.node, max: PropTypes.number, sx: PropTypes.object }

// Flat (non-tilting) elevated card for dense content like lists.
export const DepthCard = ({ children, sx }) => {
    const d = useDepth()
    return (
        <Box
            sx={{
                borderRadius: '18px',
                bgcolor: 'background.paper',
                border: `1px solid ${d.hairline}`,
                boxShadow: d.rest,
                overflow: 'hidden',
                ...sx
            }}
        >
            {children}
        </Box>
    )
}

DepthCard.propTypes = { children: PropTypes.node, sx: PropTypes.object }

// Glossy extruded icon tile (the "3D badge" used on KPI cards).
export const IconBadge = ({ icon: Icon, color, size = 44 }) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(145deg, ${shade(color, 0.25)} 0%, ${color} 55%, ${shade(color, -0.25)} 100%)`,
            boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.45)}, inset 0 -3px 0 ${alpha('#000', 0.18)}, 0 10px 20px -8px ${alpha(color, 0.7)}`,
            transform: 'translateZ(12px)',
            flexShrink: 0
        }}
    >
        <Icon size={size * 0.5} stroke={1.9} />
    </Box>
)

IconBadge.propTypes = { icon: PropTypes.elementType.isRequired, color: PropTypes.string.isRequired, size: PropTypes.number }
