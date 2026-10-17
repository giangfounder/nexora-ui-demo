import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { Box } from '@mui/material'

import MiraMascot from '@/ui-component/mira/MiraMascot'

// Geometry copied from assets/images/nexora_logo_primary.svg (viewBox cropped to 380×120).
const VB_W = 380
const VB_H = 120
const TEXT_X = 125
const BASELINE = 78
const FONT_SIZE = 52
const LETTER_SPACING = 1.8
const BLUE = '#2563EB'
// The mochi body spans 16–91% of its box (feet to 95%): size it so the body matches the cap height of the wordmark.
const BOT_SIZE = 52
const BOT_FEET = 0.93
// Radius of the soft highlight that glides over the letters (viewBox units).
const SHEEN_R = 64

const textProps = {
    y: BASELINE,
    fontFamily: "Inter, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
    fontSize: FONT_SIZE,
    fontWeight: 700,
    letterSpacing: LETTER_SPACING
}

const pct = (value, total) => `${(value / total) * 100}%`

// Mark + "NEX" + "RA" (the "O" slot is left for the mascot).
const LogoShapes = ({ color, raX, nexRef, oRef }) => (
    <>
        <g transform='translate(8, 8)'>
            <path fill={color} d='M 12 18 L 28 18 L 88 92 L 72 92 Z' />
            <path fill={color} d='M 72 18 L 88 18 L 28 92 L 12 92 Z' />
            <path d='M 20 32 C 45 8, 75 8, 100 38' fill='none' stroke={color} strokeWidth='5' strokeLinecap='round' />
            <path d='M 20 78 C 45 102, 75 102, 100 72' fill='none' stroke={color} strokeWidth='5' strokeLinecap='round' />
        </g>
        <text ref={nexRef} x={TEXT_X} fill={color} {...textProps}>
            NEX
        </text>
        {oRef && (
            <text ref={oRef} x={0} fill='none' visibility='hidden' {...textProps}>
                O
            </text>
        )}
        <text x={raX} fill={color} {...textProps}>
            RA
        </text>
    </>
)

LogoShapes.propTypes = {
    color: PropTypes.string.isRequired,
    raX: PropTypes.number.isRequired,
    nexRef: PropTypes.object,
    oRef: PropTypes.object
}

// NEXORA lockup for the login screen, with the mascot standing in for the "O".
// Light follows the pointer, kept deliberately quiet: a faint glow behind the wordmark and a soft
// highlight that glides across the letters themselves (clipped to the glyphs, never spilling out).
const LoginLockup = forwardRef(function LoginLockup({ dark = false, botRef, sx }, ref) {
    const rootRef = useRef(null)
    const nexRef = useRef(null)
    const oRef = useRef(null)
    const sheenRef = useRef(null)
    const sheenId = `sheen-${useId().replace(/:/g, '')}`
    // Inter 700 estimates; re-measured once the web font is ready.
    const [metrics, setMetrics] = useState({ nex: 118, o: 44 })
    const color = dark ? '#FFFFFF' : BLUE

    const setRefs = useCallback(
        (el) => {
            rootRef.current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) ref.current = el
        },
        [ref]
    )

    useLayoutEffect(() => {
        let alive = true
        const measure = () => {
            if (!alive || !nexRef.current || !oRef.current) return
            const nex = nexRef.current.getComputedTextLength()
            const o = oRef.current.getComputedTextLength()
            if (nex > 0 && o > 0) setMetrics({ nex, o })
        }
        measure()
        document.fonts?.ready?.then(measure)
        return () => {
            alive = false
        }
    }, [])

    // Pointer-driven light, written straight to CSS variables (no re-render per mouse move).
    useEffect(() => {
        const el = rootRef.current
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
        let raf = 0
        let last = null
        const apply = () => {
            raf = 0
            if (!last) return
            const r = el.getBoundingClientRect()
            // spot: follow the pointer but always stay behind the letters
            const px = Math.min(0.92, Math.max(0.1, (last.x - r.left) / r.width))
            const py = Math.min(0.72, Math.max(0.32, (last.y - r.top) / r.height))
            el.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`)
            el.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`)
            // sheen: highlight centre in viewBox units, allowed slightly outside so it can graze the edges
            const vx = Math.min(VB_W + 40, Math.max(-40, ((last.x - r.left) / r.width) * VB_W))
            const vy = Math.min(VB_H + 30, Math.max(-30, ((last.y - r.top) / r.height) * VB_H))
            sheenRef.current?.setAttribute('cx', vx.toFixed(1))
            sheenRef.current?.setAttribute('cy', vy.toFixed(1))
            el.style.setProperty('--glow', '1')
        }
        const onMove = (e) => {
            last = { x: e.clientX, y: e.clientY }
            if (!raf) raf = requestAnimationFrame(apply)
        }
        const onLeave = () => el.style.setProperty('--glow', '0')
        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerleave', onLeave)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('pointermove', onMove)
            document.removeEventListener('pointerleave', onLeave)
        }
    }, [])

    const oX = TEXT_X + metrics.nex
    const raX = oX + metrics.o
    const botCenter = oX + (metrics.o - LETTER_SPACING) / 2
    const botLeft = botCenter - BOT_SIZE / 2
    const botTop = BASELINE - BOT_SIZE * BOT_FEET

    return (
        <Box
            ref={setRefs}
            role='img'
            aria-label='NEXORA'
            sx={{
                position: 'relative',
                aspectRatio: `${VB_W} / ${VB_H}`,
                '--spot-x': '62%',
                '--spot-y': '55%',
                '--glow': '0',
                ...sx
            }}
        >
            {/* Backlight: soft spot behind the wordmark */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 'var(--spot-x)',
                    top: 'var(--spot-y)',
                    width: '58%',
                    aspectRatio: '2.2',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${
                        dark ? 'rgba(147,197,253,0.22)' : 'rgba(191,219,254,0.55)'
                    }, transparent 100%)`,
                    filter: 'blur(28px)',
                    opacity: 'calc(0.35 + var(--glow) * 0.65)',
                    pointerEvents: 'none',
                    transition: 'left 260ms cubic-bezier(0.22,1,0.36,1), top 260ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease-out'
                }}
            />

            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                width='100%'
                height='100%'
                style={{ position: 'relative', display: 'block', overflow: 'visible' }}
                aria-hidden
            >
                <LogoShapes color={color} raX={raX} nexRef={nexRef} oRef={oRef} />
            </svg>
            {/* Highlight gliding over the glyphs */}
            <Box
                component='svg'
                aria-hidden
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    pointerEvents: 'none',
                    opacity: 'var(--glow)',
                    transition: 'opacity 500ms ease-out',
                    mixBlendMode: dark ? 'normal' : 'screen'
                }}
            >
                <defs>
                    <radialGradient ref={sheenRef} id={sheenId} gradientUnits='userSpaceOnUse' cx='-200' cy='60' r={SHEEN_R}>
                        <stop offset='0%' stopColor='#FFFFFF' stopOpacity={dark ? 0.35 : 0.5} />
                        <stop offset='45%' stopColor='#E0F2FE' stopOpacity={dark ? 0.12 : 0.18} />
                        <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0' />
                    </radialGradient>
                </defs>
                <LogoShapes color={`url(#${sheenId})`} raX={raX} />
            </Box>
            <Box
                ref={botRef}
                sx={{
                    position: 'absolute',
                    left: pct(botLeft, VB_W),
                    top: pct(botTop, VB_H),
                    width: pct(BOT_SIZE, VB_W),
                    aspectRatio: '1',
                    zIndex: 2
                }}
            >
                <MiraMascot size='100%' cheerful interactive />
            </Box>
        </Box>
    )
})

LoginLockup.propTypes = {
    dark: PropTypes.bool,
    botRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    sx: PropTypes.object
}

export default LoginLockup
