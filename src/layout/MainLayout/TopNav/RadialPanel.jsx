import { forwardRef, useLayoutEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { alpha, lighten, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, Typography } from '@mui/material'

import { useLanguage } from '@/store/context/LanguageContext'

const ITEM = 52
// visible circle; ITEM stays the layout slot the radii were tuned for
const DOT = 46
const LABEL_W = 80
const TOP_PAD = 14
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const RADII = [60, 60, 84, 112, 120, 176, 200, 220, 248]
const radiusFor = (n) => RADII[Math.min(n, RADII.length - 1)] + Math.max(0, n - (RADII.length - 1)) * 26

// Radii were tuned so circles and two-line labels never overlap for 1–6 items.
// Items are spread evenly over the lower semicircle: each one sits in the middle of an equal
// slice (2 items → 135°/45°, 3 → 150°/90°/30°, …), so small groups don't cling to the rim.
// Radii are the smallest that keep circles, 2-line labels and the hub title from overlapping.
const layout = (n) => {
    const R = radiusFor(n)
    const D = R + ITEM / 2 + 72
    const pts = Array.from({ length: n }, (_, i) => {
        const deg = n === 1 ? 90 : 180 - ((i + 0.5) * 180) / n
        const rad = (deg * Math.PI) / 180
        return { x: D + R * Math.cos(rad), y: TOP_PAD + R * Math.sin(rad) }
    })
    return { R, D, pts }
}

const RadialPanel = forwardRef(({ id, group, isActive, onSelect, onMouseEnter, onKeyDown }, ref) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const [hovered, setHovered] = useState(null)
    const [shift, setShift] = useState(0)

    const { R, D, pts } = layout(group.items.length)
    const brand = theme.palette.primary.main
    const onBrand = theme.palette.primary.contrastText || '#fff'
    const isDark = theme.palette.mode === 'dark'
    const brandText = isDark ? lighten(brand, 0.4) : brand
    const hairline = alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08)
    const discShadow = isDark
        ? `0 28px 56px -16px ${alpha('#000', 0.7)}, 0 0 0 1px ${alpha('#fff', 0.04)}`
        : `0 28px 56px -18px ${alpha('#0f172a', 0.22)}, 0 10px 20px -12px ${alpha('#0f172a', 0.1)}`

    useLayoutEffect(() => {
        const el = ref?.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const margin = 12
        if (r.left < margin) setShift(margin - r.left)
        else if (r.right > window.innerWidth - margin) setShift(window.innerWidth - margin - r.right)
    }, [ref])

    const hubW = 140
    const hubItem = group.items.find((it) => it.id === hovered)

    return (
        <Box
            ref={ref}
            id={id}
            role='menu'
            aria-label={t(group.title)}
            onMouseEnter={onMouseEnter}
            onKeyDown={onKeyDown}
            sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                width: 2 * D,
                height: D,
                ml: `${-D + shift}px`,
                zIndex: theme.zIndex.appBar + 1
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    borderRadius: `0 0 ${D}px ${D}px`,
                    bgcolor: 'background.paper',
                    backgroundImage: `radial-gradient(circle at ${D}px 0, ${alpha(brand, isDark ? 0.14 : 0.07)}, transparent ${Math.round(
                        R * 1.1
                    )}px)`,
                    border: `1px solid ${hairline}`,
                    borderTop: 'none',
                    boxShadow: discShadow,
                    transformOrigin: `${D}px 0`,
                    '@keyframes radialDisc': {
                        from: { opacity: 0, transform: 'scale(0.82)' },
                        to: { opacity: 1, transform: 'scale(1)' }
                    },
                    animation: `radialDisc 220ms ${EASE}`,
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: D - R,
                        top: TOP_PAD - R,
                        width: 2 * R,
                        height: 2 * R,
                        borderRadius: '50%',
                        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.1 : 0.07)}`
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        left: D - 3,
                        top: TOP_PAD - 3,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: isActive ? brand : alpha(theme.palette.text.primary, 0.25),
                        boxShadow: isActive ? `0 0 0 4px ${alpha(brand, 0.14)}` : 'none'
                    }}
                />
            </Box>

            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: D - hubW / 2,
                    width: hubW,
                    top: TOP_PAD + 14,
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}
            >
                <Typography
                    sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'text.disabled',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {t(group.title)}
                </Typography>
                <Typography
                    sx={{
                        mt: 0.5,
                        minHeight: 20,
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        opacity: hubItem ? 1 : 0,
                        transform: hubItem ? 'none' : 'translateY(-3px)',
                        transition: `opacity 150ms ease-out, transform 180ms ${EASE}`
                    }}
                >
                    {hubItem ? t(hubItem.title) : '\u00a0'}
                </Typography>
            </Box>

            {group.items.map((item, i) => {
                const Icon = item.icon
                const active = item.active
                const p = pts[i]
                const dx = D - p.x
                const dy = TOP_PAD - p.y
                return (
                    <ButtonBase
                        key={item.id}
                        data-nav-item
                        role='menuitem'
                        aria-current={active ? 'page' : undefined}
                        aria-label={t(item.title)}
                        onClick={() => onSelect(item)}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered((h) => (h === item.id ? null : h))}
                        onFocus={() => setHovered(item.id)}
                        onBlur={() => setHovered((h) => (h === item.id ? null : h))}
                        sx={{
                            position: 'absolute',
                            left: p.x - LABEL_W / 2,
                            top: p.y - ITEM / 2,
                            width: LABEL_W,
                            flexDirection: 'column',
                            gap: 0.75,
                            borderRadius: '12px',
                            '--dx': `${dx}px`,
                            '--dy': `${dy}px`,
                            '@keyframes radialItem': {
                                from: { opacity: 0, transform: 'translate(var(--dx), var(--dy)) scale(0.3)' },
                                to: { opacity: 1, transform: 'translate(0, 0) scale(1)' }
                            },
                            animation: `radialItem 280ms ${EASE} both`,
                            animationDelay: `${i * 24}ms`,
                            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                            '& .radial-dot': {
                                width: DOT,
                                height: DOT,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: active ? brand : isDark ? alpha('#fff', 0.04) : theme.palette.background.paper,
                                color: active ? onBrand : 'text.secondary',
                                border: `1px solid ${active ? brand : alpha(theme.palette.text.primary, isDark ? 0.14 : 0.1)}`,
                                boxShadow: active
                                    ? `0 6px 14px -6px ${alpha(brand, 0.6)}`
                                    : `0 1px 2px ${alpha(isDark ? '#000' : '#0f172a', isDark ? 0.4 : 0.06)}`,
                                transition: `transform 180ms ${EASE}, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out, box-shadow 180ms ease-out`
                            },
                            '& .radial-label': {
                                fontSize: 12.5,
                                letterSpacing: '-0.005em',
                                color: active ? brandText : 'text.secondary',
                                fontWeight: active ? 600 : 500,
                                transition: 'color 150ms ease-out'
                            },
                            '&:hover .radial-dot, &.Mui-focusVisible .radial-dot': {
                                transform: 'translateY(-2px) scale(1.06)',
                                borderColor: brand,
                                color: active ? onBrand : brand,
                                bgcolor: active ? brand : alpha(brand, isDark ? 0.16 : 0.07),
                                boxShadow: `0 0 0 5px ${alpha(brand, isDark ? 0.18 : 0.1)}, 0 10px 18px -10px ${alpha(brand, 0.55)}`
                            },
                            '&:hover .radial-label, &.Mui-focusVisible .radial-label': {
                                color: active ? brandText : 'text.primary'
                            }
                        }}
                    >
                        <Box className='radial-dot'>{Icon && <Icon size={20} stroke={1.6} />}</Box>
                        <Typography
                            className='radial-label'
                            variant='caption'
                            sx={{
                                lineHeight: 1.25,
                                textAlign: 'center',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {t(item.title)}
                        </Typography>
                    </ButtonBase>
                )
            })}
        </Box>
    )
})

RadialPanel.displayName = 'RadialPanel'

RadialPanel.propTypes = {
    id: PropTypes.string,
    group: PropTypes.object.isRequired,
    isActive: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func,
    onKeyDown: PropTypes.func
}

export default RadialPanel
