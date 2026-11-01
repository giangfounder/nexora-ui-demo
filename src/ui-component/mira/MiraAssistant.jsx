import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Chip, Fab, IconButton, Paper, Stack, TextField, Tooltip, Typography, Zoom } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// project imports
import { useLanguage } from '@/store/context/LanguageContext'
import { getMiraReply, MIRA_QUICK_PROMPTS, mockMiraMessages } from './mockMiraChat'
import MiraMascot from './MiraMascot'
import { clearMiraArrival, readDockPos, readMiraArrival, saveDockPos } from './miraHandoff'

// above the header (1100) and page content, below drawers (1200) and dialogs (1300) so Mira never covers a form's Save button
const MIRA_Z = 1150
const MiraAvatar = ({ size = 32 }) => (
    <Box sx={{ width: size, height: size, flexShrink: 0 }}>
        <MiraMascot size={size} />
    </Box>
)

MiraAvatar.propTypes = {
    size: PropTypes.number
}

const DOCK = 52
const DOCK_MASCOT = 48
const EDGE = 12
const DRAG_THRESHOLD = 5
// Fab transform-origin sits 40% of its height below the centre (feet), see `transformOrigin` below.
const ORIGIN_DROP = DOCK * 0.4

const clampDock = (pos) => ({
    x: Math.min(Math.max(EDGE, pos.x), Math.max(EDGE, window.innerWidth - DOCK - EDGE)),
    y: Math.min(Math.max(EDGE, pos.y), Math.max(EDGE, window.innerHeight - DOCK - EDGE))
})

const defaultDock = () => ({ x: window.innerWidth - DOCK - 16, y: window.innerHeight - DOCK - 16 })

// Transform that puts the mascot's centre at (x, y) relative to its resting centre,
// compensating for the feet-anchored transform-origin so the start frame matches the login chibi exactly.
const centred = (x, y, deg, sx, sy) => {
    const rad = (deg * Math.PI) / 180
    const tx = x - ORIGIN_DROP * sy * Math.sin(rad)
    const ty = y - ORIGIN_DROP + ORIGIN_DROP * sy * Math.cos(rad)
    return `translate(${tx}px, ${ty}px) rotate(${deg}deg) scale(${sx}, ${sy})`
}

// Keyframes for a hop from the login chibi's last spot down onto the dock: crouch, parabolic leap, squash on landing.
const buildArrivalFrames = (dockEl, start) => {
    const dock = dockEl.getBoundingClientRect()
    const endX = dock.left + dock.width / 2
    const endY = dock.top + dock.height / 2

    const size = start?.size || 78
    const startX = (start ? start.x : window.innerWidth * 0.16) + size / 2
    const startY = (start ? start.y : window.innerHeight * 0.72) + size / 2
    const facing = start?.facing < 0 ? -1 : 1

    const dx = startX - endX
    const dy = startY - endY
    const s0 = size / DOCK_MASCOT
    const height = Math.max(120, Math.hypot(dx, dy) * 0.22)
    const lean = dx > 0 ? -1 : 1 // leans into the direction of travel

    const frames = [
        { offset: 0, transform: centred(dx, dy, 0, s0 * facing, s0) },
        { offset: 0.1, transform: centred(dx, dy + size * 0.08, 0, s0 * 1.14 * facing, s0 * 0.84) }
    ]
    const STEPS = 14
    for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS
        const s = s0 + (1 - s0) * t
        const stretch = 1 + 0.08 * Math.sin(Math.PI * t)
        // Facing left on the login screen: turn around mid-air to face the dock.
        let turn = facing < 0 ? -Math.cos(Math.PI * Math.min(1, t * 1.4)) : 1
        if (Math.abs(turn) < 0.05) turn = 0.05
        frames.push({
            offset: 0.16 + 0.58 * t,
            transform: centred(
                dx * (1 - t),
                dy * (1 - t) - 4 * height * t * (1 - t),
                lean * 14 * Math.sin(Math.PI * t),
                (s / stretch) * turn,
                s * stretch
            )
        })
    }
    frames.push(
        { offset: 0.8, transform: 'translate(0px, 0px) rotate(0deg) scale(1.2, 0.78)' },
        { offset: 0.88, transform: 'translate(0px, -16px) rotate(0deg) scale(0.95, 1.07)' },
        { offset: 0.94, transform: 'translate(0px, 2px) rotate(0deg) scale(1.05, 0.95)' },
        { offset: 1, transform: 'translate(0px, 0px) rotate(0deg) scale(1, 1)' }
    )
    return frames
}

// Chat panel opens next to wherever Mira is parked, on the side with more room.
const panelPlacement = (dock, viewport) => {
    const width = Math.min(360, viewport.w - 32)
    const onRight = dock.x + DOCK / 2 > viewport.w / 2
    const left = Math.min(Math.max(16, onRight ? dock.x + DOCK - width : dock.x), viewport.w - 16 - width)
    const above = dock.y - 10
    const below = viewport.h - (dock.y + DOCK) - 10
    const up = above >= below
    const room = Math.max(240, (up ? above : below) - 16)
    return {
        left,
        width,
        height: Math.min(480, room),
        ...(up ? { bottom: viewport.h - dock.y + 10 } : { top: dock.y + DOCK + 10 }),
        transformOrigin: `${onRight ? 'right' : 'left'} ${up ? 'bottom' : 'top'}`
    }
}

// ==============================|| MIRA - FLOATING INTERNAL AI ASSISTANT ||============================== //

const MiraAssistant = () => {
    const theme = useTheme()
    const { t } = useLanguage()
    const fabRef = useRef(null)
    const dragRef = useRef(null)
    const suppressClickRef = useRef(false)
    // Pure initializer (StrictMode runs it twice); the flags are cleared once the jump starts.
    const [arriving, setArriving] = useState(readMiraArrival)
    const [dock, setDock] = useState(() => clampDock(readDockPos() || defaultDock()))
    const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
    const [drag, setDrag] = useState(null) // { tilt } while the user is carrying Mira
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState(mockMiraMessages)
    const [draft, setDraft] = useState('')

    useLayoutEffect(() => {
        if (!arriving || !fabRef.current) return undefined
        const el = fabRef.current
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let animation = null
        if (!reducedMotion && el.animate) {
            animation = el.animate(buildArrivalFrames(el, arriving.start), {
                duration: 1250,
                delay: 180,
                easing: 'linear',
                fill: 'backwards'
            })
            animation.onfinish = () => setArriving(null)
        }
        clearMiraArrival()
        if (!animation) setArriving(null)
        return () => animation?.cancel()
    }, [arriving])

    useEffect(() => {
        const onResize = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight })
            setDock((prev) => clampDock(prev))
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // Drag to park Mira anywhere so she never covers a button; a plain click still opens the chat.
    const onPointerDown = (event) => {
        if (event.button !== 0 || arriving) return
        dragRef.current = {
            id: event.pointerId,
            px: event.clientX,
            py: event.clientY,
            x: dock.x,
            y: dock.y,
            lastX: event.clientX,
            moved: false
        }
        try {
            event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
            /* pointer already released — dragging still works via bubbling moves */
        }
    }

    const onPointerMove = (event) => {
        const d = dragRef.current
        if (!d || d.id !== event.pointerId) return
        const mx = event.clientX - d.px
        const my = event.clientY - d.py
        if (!d.moved && Math.hypot(mx, my) < DRAG_THRESHOLD) return
        d.moved = true
        const tilt = Math.max(-16, Math.min(16, (event.clientX - d.lastX) * 1.6))
        d.lastX = event.clientX
        setDrag({ tilt })
        setDock(clampDock({ x: d.x + mx, y: d.y + my }))
    }

    const endDrag = (event) => {
        const d = dragRef.current
        if (!d || d.id !== event.pointerId) return
        dragRef.current = null
        if (!d.moved) return
        suppressClickRef.current = true
        setDrag(null)
        saveDockPos(clampDock({ x: d.x + event.clientX - d.px, y: d.y + event.clientY - d.py }))
        // Little squash as she is set down.
        fabRef.current?.animate?.(
            [
                { transform: 'translateY(-6px) scale(1.04, 0.98)' },
                { transform: 'translateY(0) scale(1.14, 0.84)' },
                { transform: 'translateY(-5px) scale(0.96, 1.05)' },
                { transform: 'translateY(0) scale(1, 1)' }
            ],
            { duration: 380, easing: 'ease-out' }
        )
    }

    const onFabClick = () => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false
            return
        }
        setOpen((prev) => !prev)
    }

    const panel = panelPlacement(dock, viewport)
    const dockOnRight = dock.x + DOCK / 2 > viewport.w / 2

    const ask = (question) => {
        if (!question.trim()) return
        const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: question.trim(), at: t('Now') }
        const reply = { id: `m-${Date.now() + 1}`, sender: 'mira', text: getMiraReply(question), at: t('Now') }
        setMessages((prev) => [...prev, userMsg, reply])
        setDraft('')
    }

    return (
        <>
            <Zoom in={open} unmountOnExit>
                <Paper
                    elevation={8}
                    style={panel}
                    sx={{
                        position: 'fixed',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        zIndex: MIRA_Z
                    }}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        spacing={1.25}
                        sx={{
                            p: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'text.primary',
                            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                        }}
                    >
                        <MiraAvatar size={34} />
                        <Stack sx={{ flex: 1 }} spacing={0}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Mira</Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                {t('Trợ lý nội bộ')}
                            </Typography>
                        </Stack>
                        <IconButton size='small' aria-label={t('Đóng')} onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>
                            <AppIcon name='X' size={18} />
                        </IconButton>
                    </Stack>

                    <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', p: 1.5 }} aria-live='polite' aria-atomic='false'>
                        {messages.map((m) => {
                            const isUser = m.sender === 'user'
                            return (
                                <Stack key={m.id} alignItems={isUser ? 'flex-end' : 'flex-start'} sx={{ width: '100%' }}>
                                    <Box
                                        sx={{
                                            maxWidth: '85%',
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 2,
                                            bgcolor: isUser
                                                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
                                                : alpha(theme.palette.text.primary, 0.05),
                                            color: 'text.primary',
                                            border: `1px solid ${
                                                isUser
                                                    ? alpha(theme.palette.primary.main, 0.2)
                                                    : theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
                                            }`
                                        }}
                                    >
                                        {/* Mira's replies are fixed demo copy, so they follow the active language; user text is shown as typed. */}
                                        <Typography variant='body2'>{isUser ? m.text : t(m.text)}</Typography>
                                    </Box>
                                </Stack>
                            )
                        })}
                    </Stack>

                    <Stack direction='row' spacing={0.75} sx={{ px: 1.5, pb: 1, flexWrap: 'wrap', gap: 0.75 }}>
                        {MIRA_QUICK_PROMPTS.map((prompt) => (
                            <Chip key={prompt} size='small' variant='outlined' label={t(prompt)} onClick={() => ask(t(prompt))} />
                        ))}
                    </Stack>

                    <Stack direction='row' spacing={1} sx={{ p: 1.5, pt: 0.5 }}>
                        <TextField
                            fullWidth
                            size='small'
                            placeholder={t('Hỏi Mira bất cứ điều gì…')}
                            aria-label={t('Gửi tin cho Mira')}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    ask(draft)
                                }
                            }}
                        />
                        <IconButton color='primary' aria-label={t('Gửi')} onClick={() => ask(draft)}>
                            <AppIcon name='ArrowCircleUp' size={22} />
                        </IconButton>
                    </Stack>
                </Paper>
            </Zoom>

            <Tooltip title={drag ? '' : open ? t('Đóng') : t('Hỏi Mira · kéo để đổi chỗ')} placement={dockOnRight ? 'left' : 'right'}>
                <Fab
                    aria-label={open ? t('Đóng') : t('Hỏi Mira')}
                    onClick={onFabClick}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    disableRipple
                    ref={fabRef}
                    style={{ left: dock.x, top: dock.y }}
                    sx={{
                        position: 'fixed',
                        zIndex: MIRA_Z,
                        touchAction: 'none',
                        cursor: drag ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        width: DOCK,
                        height: DOCK,
                        minHeight: DOCK,
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'visible',
                        transformOrigin: '50% 90%',
                        '&:hover': { bgcolor: 'transparent', boxShadow: 'none' },
                        '&:focus-visible': { boxShadow: theme.customShadows?.focusRing }
                    }}
                >
                    <Box
                        data-handoff='mira'
                        sx={{
                            lineHeight: 0,
                            pointerEvents: 'none',
                            transformOrigin: '50% 20%',
                            transition: drag ? 'transform 90ms linear' : 'transform 200ms ease-out',
                            transform: drag ? `translateY(-8px) rotate(${drag.tilt}deg) scale(1.06)` : 'none',
                            filter: drag ? 'drop-shadow(0 10px 12px rgba(37, 99, 235, 0.28))' : 'none'
                        }}
                    >
                        <MiraMascot size={DOCK_MASCOT} running={Boolean(drag)} />
                    </Box>
                    {open && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'text.primary',
                                color: 'background.paper',
                                border: '2px solid',
                                borderColor: 'background.paper'
                            }}
                        >
                            <AppIcon name='X' size={12} />
                        </Box>
                    )}
                </Fab>
            </Tooltip>
        </>
    )
}

export default MiraAssistant
