import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'

import { shade } from './depth'

const W = 260
const H = 190
const CX = W / 2
const CY = 82
const RX = 108
const RY = 58
const DEPTH = 24
const TAU = Math.PI * 2

const pt = (a, dy = 0, off = { x: 0, y: 0 }) => [CX + off.x + RX * Math.cos(a), CY + off.y + dy + RY * Math.sin(a)]

// Part of the outer wall between angles a..b (only the front half, where sin > 0, is visible).
const wallPath = (a, b, off) => {
    const [x1, y1] = pt(a, 0, off)
    const [x2, y2] = pt(b, 0, off)
    const [x3, y3] = pt(b, DEPTH, off)
    const [x4, y4] = pt(a, DEPTH, off)
    const large = b - a > Math.PI ? 1 : 0
    return `M${x1} ${y1} A${RX} ${RY} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${RX} ${RY} 0 ${large} 0 ${x4} ${y4} Z`
}

const topPath = (a, b, off) => {
    const [x1, y1] = pt(a, 0, off)
    const [x2, y2] = pt(b, 0, off)
    const large = b - a > Math.PI ? 1 : 0
    return `M${CX + off.x} ${CY + off.y} L${x1} ${y1} A${RX} ${RY} 0 ${large} 1 ${x2} ${y2} Z`
}

// Radial side walls, shown when a slice is pulled out.
const sidePath = (a, off) => {
    const [x, y] = pt(a, 0, off)
    return `M${CX + off.x} ${CY + off.y} L${x} ${y} L${x} ${y + DEPTH} L${CX + off.x} ${CY + off.y + DEPTH} Z`
}

// Visible (front-facing) parts of [a, b] — intersect with (0, π) and (2π, 3π).
const visibleSpans = (a, b) =>
    [
        [0, Math.PI],
        [TAU, TAU + Math.PI]
    ]
        .map(([s, e]) => [Math.max(a, s), Math.min(b, e)])
        .filter(([s, e]) => e - s > 0.001)

// ==============================|| DASHBOARD — 3D PIE ||============================== //

const Pie3D = ({ data, t }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [hover, setHover] = useState(null)
    const [grow, setGrow] = useState(0)
    const total = data.reduce((s, d) => s + d.value, 0) || 1

    // Slices sweep in on mount.
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setGrow(1)
            return undefined
        }
        let raf
        const t0 = performance.now()
        const step = (now) => {
            const p = Math.min(1, (now - t0) / 900)
            setGrow(1 - Math.pow(1 - p, 3))
            if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [])

    // Start at the back (−90°) so the biggest wall faces the viewer.
    let acc = -Math.PI / 2
    const slices = data.map((d, i) => {
        const sweep = (d.value / total) * TAU * grow
        const a = acc
        acc += sweep
        const mid = a + sweep / 2
        const off = hover === i ? { x: Math.cos(mid) * 10, y: Math.sin(mid) * 6 } : { x: 0, y: 0 }
        // normalise into [0, 2π) + keep order for the visibility test
        const na = ((a % TAU) + TAU) % TAU
        return { ...d, i, a, b: a + sweep, na, nb: na + sweep, off }
    })

    // Paint back-to-front: slices whose middle sits lower (larger sin) are drawn last.
    const order = [...slices].sort((s1, s2) => Math.sin((s1.a + s1.b) / 2) - Math.sin((s2.a + s2.b) / 2))

    return (
        <Stack direction='row' alignItems='center' spacing={2} sx={{ height: '100%' }}>
            <Box
                component='svg'
                viewBox={`0 0 ${W} ${H}`}
                role='img'
                aria-label={t('Tỉ lệ trạng thái hội thoại')}
                sx={{ width: '52%', maxWidth: 250, overflow: 'visible', flexShrink: 0 }}
            >
                <ellipse
                    cx={CX}
                    cy={CY + DEPTH + 16}
                    rx={RX * 0.95}
                    ry={RY * 0.55}
                    fill={isDark ? '#000' : '#0B1220'}
                    opacity={isDark ? 0.4 : 0.08}
                />
                {order.map((s) => (
                    <g
                        key={s.key}
                        onPointerEnter={() => setHover(s.i)}
                        onPointerLeave={() => setHover(null)}
                        style={{ cursor: 'pointer', transition: 'transform 200ms ease-out' }}
                    >
                        {hover === s.i && (
                            <>
                                <path d={sidePath(s.a, s.off)} fill={shade(s.color, -0.35)} />
                                <path d={sidePath(s.b, s.off)} fill={shade(s.color, -0.35)} />
                            </>
                        )}
                        {visibleSpans(s.na, s.nb).map(([p, q]) => (
                            <path key={p} d={wallPath(p, q, s.off)} fill={shade(s.color, -0.25)} />
                        ))}
                        <path d={topPath(s.a, s.b, s.off)} fill={s.color} />
                        <path d={topPath(s.a, s.b, s.off)} fill='url(#pieGloss)' />
                    </g>
                ))}
                <defs>
                    <radialGradient id='pieGloss' cx='38%' cy='25%' r='75%'>
                        <stop offset='0%' stopColor='#fff' stopOpacity={isDark ? 0.2 : 0.35} />
                        <stop offset='60%' stopColor='#fff' stopOpacity='0' />
                    </radialGradient>
                </defs>
            </Box>

            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                {slices.map((s) => (
                    <Stack
                        key={s.key}
                        direction='row'
                        alignItems='center'
                        spacing={1.25}
                        onPointerEnter={() => setHover(s.i)}
                        onPointerLeave={() => setHover(null)}
                        sx={{ cursor: 'default', opacity: hover === null || hover === s.i ? 1 : 0.5, transition: 'opacity 150ms ease-out' }}
                    >
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '3px',
                                bgcolor: s.color,
                                boxShadow: `0 2px 0 ${shade(s.color, -0.3)}`,
                                flexShrink: 0
                            }}
                        />
                        <Typography variant='body2' sx={{ flex: 1, minWidth: 0 }} noWrap>
                            {t(s.label)}
                        </Typography>
                        <Typography variant='body2' sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {Math.round((s.value / total) * 100)}%
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    )
}

Pie3D.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, value: PropTypes.number, color: PropTypes.string })
    ).isRequired,
    t: PropTypes.func.isRequired
}

export default Pie3D
