import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'

import { useLanguage } from '@/store/context/LanguageContext'
import { getChannelIcon } from '@/views/omnichannel/utils'
import { shade } from './depth'

const H = 300 // drawing height (px, viewBox units)
const FLOOR = 250 // baseline y
const TOP_PAD = 34
const DX_RATIO = 0.55 // depth of each prism relative to its width
const DY_RATIO = 0.3

// ==============================|| DASHBOARD — ISOMETRIC 3D BARS ||============================== //

const IsoBarChart = ({ data, t, formatValue }) => {
    const theme = useTheme()
    const { locale } = useLanguage()
    const fmt = formatValue || ((v) => v.toLocaleString(locale))
    const isDark = theme.palette.mode === 'dark'
    const [hover, setHover] = useState(null)
    const wrapRef = useRef(null)
    const [width, setWidth] = useState(900)
    const [grow, setGrow] = useState(0)
    const dataKey = data.map((d) => `${d.key}:${d.value}`).join('|')

    // Bars rise whenever the data changes (range switch).
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setGrow(1)
            return undefined
        }
        let raf
        const t0 = performance.now()
        setGrow(0)
        const step = (now) => {
            const p = Math.min(1, (now - t0) / 800)
            setGrow(1 - Math.pow(1 - p, 3))
            if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [dataKey])

    // Draw in real pixels so the chart keeps a fixed height instead of scaling with the card width.
    useLayoutEffect(() => {
        const el = wrapRef.current
        if (!el) return undefined
        const ro = new ResizeObserver(([entry]) => setWidth(Math.max(320, Math.round(entry.contentRect.width))))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const n = data.length
    const W = width
    const step = (W - 40) / n
    const w = step * 0.52
    const dx = w * DX_RATIO
    const dy = w * DY_RATIO
    const max = Math.max(...data.map((d) => d.value), 1)
    const scale = (FLOOR - TOP_PAD - dy) / max
    // Narrow cards: values only for the touched bar, icons without names.
    const compact = W < 640
    const gridColor = alpha(theme.palette.text.primary, isDark ? 0.1 : 0.07)
    const ticks = [0.25, 0.5, 0.75, 1]

    return (
        <Box ref={wrapRef} sx={{ position: 'relative' }}>
            <Box
                component='svg'
                viewBox={`0 0 ${W} ${H}`}
                role='img'
                aria-label={t('Số cuộc thoại theo kênh')}
                sx={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id='isoFloor' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={theme.palette.primary.main} stopOpacity={isDark ? 0.16 : 0.08} />
                        <stop offset='100%' stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* back wall grid */}
                {ticks.map((k) => {
                    const y = FLOOR - dy - (FLOOR - TOP_PAD - dy) * k
                    return <line key={k} x1={20 + dx} x2={W - 10} y1={y} y2={y} stroke={gridColor} strokeDasharray='4 6' />
                })}
                {/* floor slab */}
                <path
                    d={`M20 ${FLOOR} L${20 + dx} ${FLOOR - dy} L${W - 10} ${FLOOR - dy} L${W - 10 - dx} ${FLOOR} Z`}
                    fill='url(#isoFloor)'
                />
                <line x1={20} x2={W - 10 - dx} y1={FLOOR} y2={FLOOR} stroke={gridColor} />

                {data.map((d, i) => {
                    const x = 20 + i * step + (step - w) / 2
                    const h = Math.max(2, d.value * scale * grow)
                    const top = FLOOR - h
                    const lift = hover === i ? 6 : 0
                    const c = d.color
                    const front = `M${x} ${top - lift} h${w} V${FLOOR - lift} h${-w} Z`
                    const side = `M${x + w} ${top - lift} l${dx} ${-dy} V${FLOOR - dy - lift} l${-dx} ${dy} Z`
                    const cap = `M${x} ${top - lift} l${dx} ${-dy} h${w} l${-dx} ${dy} Z`
                    const dim = hover !== null && hover !== i
                    return (
                        <g
                            key={d.key}
                            onPointerEnter={() => setHover(i)}
                            onPointerLeave={() => setHover(null)}
                            style={{ cursor: 'pointer', opacity: dim ? 0.45 : 1, transition: 'opacity 160ms ease-out' }}
                        >
                            {/* contact shadow */}
                            <ellipse
                                cx={x + w / 2 + dx / 2}
                                cy={FLOOR - dy / 2 + 4}
                                rx={w * 0.75}
                                ry={dy * 0.6}
                                fill={isDark ? '#000' : '#0B1220'}
                                opacity={isDark ? 0.35 : 0.1}
                            />
                            <path d={side} fill={shade(c, -0.32)} />
                            <path d={front} fill={c} />
                            <path d={front} fill={`url(#isoSheen-${i})`} />
                            <path d={cap} fill={shade(c, 0.28)} />
                            <defs>
                                <linearGradient id={`isoSheen-${i}`} x1='0' y1='0' x2='1' y2='0'>
                                    <stop offset='0%' stopColor='#fff' stopOpacity={isDark ? 0.14 : 0.22} />
                                    <stop offset='55%' stopColor='#fff' stopOpacity='0' />
                                    <stop offset='100%' stopColor='#000' stopOpacity={isDark ? 0.2 : 0.12} />
                                </linearGradient>
                            </defs>
                            {/* value on top */}
                            <text
                                x={x + w / 2 + dx / 2}
                                y={top - lift - dy - 8}
                                textAnchor='middle'
                                fontSize={compact ? 12 : 13}
                                fontWeight='700'
                                fill={theme.palette.text.primary}
                                style={{
                                    fontVariantNumeric: 'tabular-nums',
                                    opacity: grow > 0.9 && (!compact || hover === i) ? 1 : 0,
                                    transition: 'opacity 200ms'
                                }}
                            >
                                {fmt(d.value)}
                            </text>
                        </g>
                    )
                })}
            </Box>

            {/* channel icons under each bar (HTML so brand SVGs render crisply) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, px: `${(20 / W) * 100}%`, mt: -1 }}>
                {data.map((d, i) => {
                    const Icon = getChannelIcon(d.key)
                    return (
                        <Stack
                            key={d.key}
                            alignItems='center'
                            spacing={0.5}
                            onPointerEnter={() => setHover(i)}
                            onPointerLeave={() => setHover(null)}
                            sx={{ minWidth: 0, opacity: hover !== null && hover !== i ? 0.45 : 1, transition: 'opacity 160ms ease-out' }}
                        >
                            <Box
                                sx={{
                                    width: compact ? 24 : 30,
                                    height: compact ? 24 : 30,
                                    borderRadius: '10px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: 'background.paper',
                                    boxShadow: `0 4px 10px -4px ${
                                        isDark ? alpha('#000', 0.6) : alpha('#0B1220', 0.25)
                                    }, 0 0 0 1px ${gridColor}`
                                }}
                            >
                                <Icon size={compact ? 14 : 17} />
                            </Box>
                            {!compact && (
                                <Typography
                                    variant='caption'
                                    noWrap
                                    sx={{
                                        maxWidth: '100%',
                                        color: hover === i ? 'text.primary' : 'text.secondary',
                                        fontWeight: hover === i ? 600 : 500
                                    }}
                                >
                                    {d.label}
                                </Typography>
                            )}
                        </Stack>
                    )
                })}
            </Box>
        </Box>
    )
}

IsoBarChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, value: PropTypes.number, color: PropTypes.string })
    ).isRequired,
    t: PropTypes.func.isRequired,
    formatValue: PropTypes.func
}

export default IsoBarChart
