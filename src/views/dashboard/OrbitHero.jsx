import { useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { alpha } from '@mui/material/styles'
import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { CHANNELS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'

const NAVY = '#0B1220'
const BLUE = '#2563EB'
const CYAN = '#22D3EE'
const TILT = 64 // how far the orbit plane leans back
const BASE_W = 480 // orbit area width the ring sizes are designed for

// Channels ride on three rings; each ring spins at its own pace.
// Rings are far apart and offset in phase so chips on different rings rarely line up.
const RINGS = [
    { r: 96, dur: 30, size: 32, count: 3, phase: 0 },
    { r: 152, dur: 46, size: 34, count: 3, phase: 60 },
    { r: 208, dur: 64, size: 36, count: 4, phase: 20 }
]

const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Chào buổi sáng'
    if (h < 14) return 'Chào buổi trưa'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
}

// ==============================|| DASHBOARD — ORBIT HERO ||============================== //

const OrbitHero = ({ t, openCount, needsHuman, channels, onOpenInbox }) => {
    // Distribute channels across rings, evenly spaced per ring.
    let cursor = 0
    const placed = RINGS.map((ring) => {
        const list = channels.slice(cursor, cursor + ring.count)
        cursor += ring.count
        return list.map((ch, i) => ({ ch, angle: (360 / Math.max(1, list.length)) * i + ring.phase }))
    })

    // The orbit scales with the space it gets, so wide screens don't leave an empty band.
    const orbitRef = useRef(null)
    const [scale, setScale] = useState(1)
    useLayoutEffect(() => {
        const el = orbitRef.current
        if (!el) return undefined
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            setScale(Math.max(0.6, Math.min(1.15, width / BASE_W, height / 330)))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                minHeight: 300,
                borderRadius: '20px',
                overflow: 'hidden',
                color: '#fff',
                background: `radial-gradient(120% 140% at 85% 30%, #1E3A8A 0%, ${NAVY} 58%), ${NAVY}`,
                boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 24px 48px -24px ${alpha(BLUE, 0.6)}`,
                display: 'flex',
                alignItems: 'stretch',
                '@keyframes orbitSpin': { to: { transform: 'rotate(360deg)' } },
                '@keyframes orbitCounter': { to: { transform: 'rotate(-360deg)' } },
                '@keyframes corePulse': {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.55 },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.25)', opacity: 0.2 }
                },
                '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important' } }
            }}
        >
            {/* soft star dust */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.5,
                    backgroundImage: `radial-gradient(${alpha('#fff', 0.5)} 1px, transparent 1.2px)`,
                    backgroundSize: '26px 26px',
                    maskImage: 'radial-gradient(60% 100% at 74% 50%, #000 0%, transparent 80%)'
                }}
            />

            {/* Copy */}
            <Stack
                justifyContent='center'
                spacing={2.25}
                sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4.5 }, flex: 1, minWidth: 0 }}
            >
                <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '1rem', fontWeight: 500 }}>{t(greeting())}</Typography>
                <Box>
                    <Stack direction='row' alignItems='baseline' spacing={1.5}>
                        <Typography
                            component='span'
                            sx={{
                                fontFamily: `'Space Grotesk', 'Inter', sans-serif`,
                                fontSize: { xs: '3rem', md: '4rem', xl: '4.5rem' },
                                fontWeight: 700,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                                fontVariantNumeric: 'tabular-nums',
                                background: `linear-gradient(180deg, #fff 30%, ${alpha(CYAN, 0.85)} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {openCount}
                        </Typography>
                        <Typography sx={{ color: alpha('#fff', 0.85), fontSize: { xs: '1.125rem', md: '1.25rem' }, fontWeight: 600 }}>
                            {t('cuộc thoại đang mở')}
                        </Typography>
                    </Stack>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                    <Box
                        component='span'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            height: 30,
                            borderRadius: '999px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            bgcolor: alpha('#F43F5E', 0.18),
                            color: '#FECDD3',
                            border: `1px solid ${alpha('#F43F5E', 0.35)}`
                        }}
                    >
                        <AppIcon name='BellRinging' size={14} color='#FB7185' />
                        {t('{n} cần xử lý', { n: needsHuman })}
                    </Box>
                    <ButtonBase
                        onClick={onOpenInbox}
                        sx={{
                            gap: 0.75,
                            px: 1.75,
                            height: 30,
                            borderRadius: '999px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: NAVY,
                            bgcolor: '#fff',
                            boxShadow: `0 8px 20px -8px ${alpha(CYAN, 0.8)}`,
                            transition: 'transform 160ms ease-out',
                            '&:hover': { transform: 'translateY(-1px)' },
                            '&.Mui-focusVisible': { outline: `2px solid ${CYAN}`, outlineOffset: 2 }
                        }}
                    >
                        {t('Mở hộp thư')}
                        <AppIcon name='ArrowRight' size={15} />
                    </ButtonBase>
                </Stack>
            </Stack>

            {/* 3D orbit */}
            <Box
                ref={orbitRef}
                aria-hidden
                sx={{
                    position: 'relative',
                    flex: { sm: '0 0 52%', lg: '0 0 56%' },
                    display: { xs: 'none', sm: 'block' },
                    perspective: '1000px'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 0,
                        height: 0,
                        transformStyle: 'preserve-3d',
                        transform: `scale(${scale})`
                    }}
                >
                    {/* core glow */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 170,
                            height: 170,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${alpha(CYAN, 0.55)} 0%, transparent 70%)`,
                            animation: 'corePulse 4s ease-in-out infinite'
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 66,
                            height: 66,
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '50%',
                            background: `radial-gradient(circle at 35% 30%, #fff 0%, ${CYAN} 22%, ${BLUE} 60%, #1E3A8A 100%)`,
                            boxShadow: `0 0 40px ${alpha(CYAN, 0.6)}, inset -6px -8px 16px ${alpha('#000', 0.35)}`,
                            zIndex: 2
                        }}
                    />
                    {/* tilted orbit plane */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transformStyle: 'preserve-3d',
                            transform: `rotateX(${TILT}deg) rotateZ(-18deg)`
                        }}
                    >
                        {RINGS.map((ring, ri) => (
                            <Box
                                key={ring.r}
                                sx={{
                                    position: 'absolute',
                                    left: -ring.r,
                                    top: -ring.r,
                                    width: ring.r * 2,
                                    height: ring.r * 2,
                                    borderRadius: '50%',
                                    border: `2px solid ${alpha(ri === 1 ? CYAN : '#93C5FD', ri === 1 ? 0.75 : 0.45)}`,
                                    boxShadow: `0 0 18px ${alpha(CYAN, ri === 1 ? 0.25 : 0.1)}`,
                                    transformStyle: 'preserve-3d',
                                    animation: `orbitSpin ${ring.dur}s linear infinite`
                                }}
                            >
                                {placed[ri].map(({ ch, angle }) => {
                                    const Icon = getChannelIcon(ch)
                                    return (
                                        <Box
                                            key={ch}
                                            sx={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                transformStyle: 'preserve-3d',
                                                transform: `rotate(${angle}deg) translateX(${ring.r}px) rotate(${-angle}deg)`
                                            }}
                                        >
                                            {/* undo the ring spin and the plane tilt so the chip faces the viewer */}
                                            <Box
                                                sx={{
                                                    transformStyle: 'preserve-3d',
                                                    animation: `orbitCounter ${ring.dur}s linear infinite`
                                                }}
                                            >
                                                <Box sx={{ transform: `rotateZ(18deg) rotateX(${-TILT}deg)` }}>
                                                    <Box
                                                        title={CHANNELS[ch]?.label}
                                                        sx={{
                                                            width: ring.size,
                                                            height: ring.size,
                                                            ml: `${-ring.size / 2}px`,
                                                            mt: `${-ring.size / 2}px`,
                                                            borderRadius: '50%',
                                                            bgcolor: '#fff',
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            boxShadow: `0 6px 14px -4px ${alpha('#000', 0.5)}, 0 0 0 3px ${alpha(
                                                                '#fff',
                                                                0.12
                                                            )}`
                                                        }}
                                                    >
                                                        <Icon size={ring.size * 0.58} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

OrbitHero.propTypes = {
    t: PropTypes.func.isRequired,
    openCount: PropTypes.number.isRequired,
    needsHuman: PropTypes.number.isRequired,
    channels: PropTypes.arrayOf(PropTypes.string).isRequired,
    onOpenInbox: PropTypes.func
}

export default OrbitHero
