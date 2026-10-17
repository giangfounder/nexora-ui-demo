import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { alpha, lighten, useTheme } from '@mui/material/styles'
import { Box, ButtonBase } from '@mui/material'
import { IconApps, IconBriefcase, IconLayoutDashboard, IconRoute, IconSettings, IconShieldLock } from '@tabler/icons-react'

import { menuItems } from '@/menu-items'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/store/context/LanguageContext'
import { headerHeight } from '@/store/constant'
import RadialPanel from './RadialPanel'

// Hover intent: open slightly delayed so a cursor sweeping across the bar does not flash panels,
// close with a grace period so small overshoots toward the panel do not dismiss it.
const OPEN_DELAY = 60
const CLOSE_DELAY = 200
// While a fan is open, the pointer often crosses a neighbouring trigger on its way down to a
// far-left/right item. Only switch groups if the pointer actually rests on the other trigger.
const SWITCH_DELAY = 250
// trigger / pill height
const PILL_H = 36

const GROUP_ICONS = {
    overview: IconLayoutDashboard,
    operations: IconBriefcase,
    ai: IconRoute,
    apps: IconApps,
    system: IconSettings,
    management: IconShieldLock
}

const flattenItems = (menus) =>
    menus.flatMap((m) => (m.type === 'collapse' ? flattenItems(m.children || []) : m.type === 'item' ? [m] : []))

const isItemActive = (item, pathname) => {
    if (!item.url) return false
    if (item.url === '/') return pathname === '/'
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
}

const TopNav = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { hasPermission, hasDisplay } = useAuth()
    const { t, language } = useLanguage()

    const [openId, setOpenId] = useState(null)
    const openTimer = useRef(null)
    const closeTimer = useRef(null)
    const triggerRefs = useRef({})
    const panelRef = useRef(null)

    const groups = useMemo(() => {
        const visible = (m) => {
            if (m.permission && !hasPermission(m.permission)) return false
            if (m.display) return hasDisplay(m.display)
            return true
        }
        return menuItems.items
            .flatMap((root) => root.children || [])
            .map((g) => ({ ...g, items: flattenItems(g.children || []).filter(visible) }))
            .filter((g) => g.items.length > 0)
    }, [hasPermission, hasDisplay])

    const groupKey = groups.map((g) => g.id).join('|')

    const clearTimers = () => {
        clearTimeout(openTimer.current)
        clearTimeout(closeTimer.current)
    }

    const scheduleOpen = (id) => {
        clearTimers()
        if (openId === id) return
        openTimer.current = setTimeout(() => setOpenId(id), openId ? SWITCH_DELAY : OPEN_DELAY)
    }

    const scheduleClose = () => {
        clearTimeout(openTimer.current)
        clearTimeout(closeTimer.current)
        closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY)
    }

    const cancelClose = () => clearTimeout(closeTimer.current)

    const close = useCallback((returnFocusId) => {
        clearTimeout(openTimer.current)
        clearTimeout(closeTimer.current)
        setOpenId(null)
        if (returnFocusId) triggerRefs.current[returnFocusId]?.focus()
    }, [])

    useEffect(() => {
        close()
    }, [pathname, close])

    useEffect(() => () => clearTimers(), [])

    useEffect(() => {
        if (!openId) return undefined
        const onDown = (e) => {
            if (panelRef.current?.contains(e.target)) return
            if (Object.values(triggerRefs.current).some((el) => el?.contains(e.target))) return
            close()
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [openId, close])

    const focusFirstItem = () => {
        requestAnimationFrame(() => panelRef.current?.querySelector('[data-nav-item]')?.focus())
    }

    const onTriggerKeyDown = (e, idx, id) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            clearTimers()
            setOpenId(id)
            focusFirstItem()
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault()
            const next = groups[(idx + (e.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length]
            triggerRefs.current[next.id]?.focus()
            if (openId) setOpenId(next.id)
        } else if (e.key === 'Escape') {
            close(id)
        }
    }

    const onPanelKeyDown = (e, id) => {
        const items = [...(panelRef.current?.querySelectorAll('[data-nav-item]') || [])]
        const i = items.indexOf(document.activeElement)
        if (e.key === 'Escape') {
            e.preventDefault()
            close(id)
        } else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault()
            const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
            const next = items[(i + (forward ? 1 : -1) + items.length) % items.length]
            next?.focus()
        }
    }

    const brand = theme.palette.primary.main
    const isDark = theme.palette.mode === 'dark'
    const openGroup = groups.find((g) => g.id === openId)
    const activeGroupId = groups.find((g) => g.items.some((it) => isItemActive(it, pathname)))?.id

    // Two surfaces glide between triggers: a neutral one under the pointer, a brand-tinted pill under the current section.
    const railRef = useRef(null)
    const [hoverId, setHoverId] = useState(null)
    const [rects, setRects] = useState({})
    const measure = useCallback(() => {
        const rail = railRef.current
        if (!rail) return
        // layout units (offset*), not screen pixels, so page/CSS zoom can't misplace the pills
        const next = {}
        Object.entries(triggerRefs.current).forEach(([gid, el]) => {
            if (!el || !el.parentElement) return
            next[gid] = { left: el.parentElement.offsetLeft + el.offsetLeft, width: el.offsetWidth }
        })
        setRects((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }, [])
    useLayoutEffect(() => {
        measure()
        const rail = railRef.current
        if (!rail || !window.ResizeObserver) return undefined
        const ro = new ResizeObserver(measure)
        ro.observe(rail)
        return () => ro.disconnect()
        // useAuth hands out new functions every render, so key on the visible group ids + language instead of `groups`
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [measure, groupKey, language])
    const highlightId = hoverId || openId
    const highlight = highlightId && rects[highlightId]
    const indicator = activeGroupId && rects[activeGroupId]
    const glide = 'left 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1)'
    // resting label/icon: a touch darker than text.secondary so the bar reads crisp, not washed out
    const restColor = alpha(theme.palette.text.primary, isDark ? 0.72 : 0.7)
    const iconColor = alpha(theme.palette.text.primary, isDark ? 0.5 : 0.45)
    // palette.primary.light is a dark tint in dark mode — lighten the brand explicitly for text
    const activeText = isDark ? lighten(brand, 0.4) : theme.palette.primary.dark

    return (
        <Box
            component='nav'
            aria-label={t('Điều hướng chính')}
            sx={{ display: 'flex', alignItems: 'stretch', height: headerHeight, ml: 2.5 }}
        >
            {/* hairline between brand and navigation */}
            <Box
                aria-hidden
                sx={{ alignSelf: 'center', width: '1px', height: 20, mr: 2, bgcolor: theme.palette.alpha?.border || 'divider' }}
            />
            <Box
                ref={railRef}
                onMouseLeave={() => setHoverId(null)}
                sx={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: 0.25 }}
            >
                {/* gliding hover surface */}
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        height: PILL_H,
                        mt: `${-PILL_H / 2}px`,
                        left: highlight ? highlight.left : 0,
                        width: highlight ? highlight.width : 0,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.text.primary, isDark ? 0.07 : 0.045),
                        opacity: highlight && highlightId !== activeGroupId ? 1 : 0,
                        transition: `${glide}, opacity 160ms ease-out`,
                        pointerEvents: 'none'
                    }}
                />
                {/* current-section pill */}
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        height: PILL_H,
                        mt: `${-PILL_H / 2}px`,
                        left: indicator ? indicator.left : 0,
                        width: indicator ? indicator.width : 0,
                        borderRadius: '10px',
                        bgcolor: alpha(brand, isDark ? 0.16 : 0.07),
                        boxShadow: `inset 0 0 0 1px ${alpha(brand, isDark ? 0.28 : 0.14)}`,
                        opacity: indicator ? 1 : 0,
                        transition: `${glide}, opacity 160ms ease-out`,
                        pointerEvents: 'none'
                    }}
                />

                {groups.map((g, idx) => {
                    const isOpen = openId === g.id
                    const hasActive = g.id === activeGroupId
                    const GroupIcon = GROUP_ICONS[g.id]
                    return (
                        <Box
                            key={g.id}
                            sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={() => {
                                setHoverId(g.id)
                                scheduleOpen(g.id)
                            }}
                            onMouseLeave={scheduleClose}
                        >
                            <ButtonBase
                                ref={(el) => {
                                    triggerRefs.current[g.id] = el
                                }}
                                aria-haspopup='true'
                                aria-expanded={isOpen}
                                aria-controls={isOpen ? `topnav-panel-${g.id}` : undefined}
                                aria-current={hasActive ? 'true' : undefined}
                                onClick={() => {
                                    clearTimers()
                                    setOpenId(g.id)
                                }}
                                onFocus={() => setHoverId(g.id)}
                                onBlur={() => setHoverId(null)}
                                onKeyDown={(e) => onTriggerKeyDown(e, idx, g.id)}
                                aria-label={t(g.title)}
                                disableRipple
                                sx={{
                                    position: 'relative',
                                    height: PILL_H,
                                    // 900–1079px: icon-only so the bar still fits; icon + label from 1080px
                                    px: 1.25,
                                    '@media (min-width: 1080px)': { pl: 1.25, pr: 1.5 },
                                    gap: 1,
                                    borderRadius: '10px',
                                    fontSize: 14,
                                    lineHeight: 1,
                                    letterSpacing: '-0.011em',
                                    fontWeight: hasActive ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                    color: hasActive ? activeText : restColor,
                                    transition: 'color 150ms ease-out',
                                    '&:hover': { color: hasActive ? undefined : 'text.primary' },
                                    '&:hover .topnav-icon': { color: hasActive ? brand : 'text.primary' },
                                    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                }}
                            >
                                {GroupIcon && (
                                    <Box
                                        component='span'
                                        className='topnav-icon'
                                        sx={{
                                            display: 'inline-flex',
                                            color: hasActive ? (isDark ? activeText : brand) : iconColor,
                                            transition: 'color 150ms ease-out'
                                        }}
                                    >
                                        <GroupIcon size={17} stroke={hasActive ? 1.9 : 1.6} />
                                    </Box>
                                )}
                                <Box component='span' sx={{ display: 'none', '@media (min-width: 1080px)': { display: 'inline' } }}>
                                    {t(g.title)}
                                </Box>
                            </ButtonBase>

                            {isOpen && openGroup && (
                                <RadialPanel
                                    ref={panelRef}
                                    id={`topnav-panel-${g.id}`}
                                    group={{
                                        ...openGroup,
                                        items: openGroup.items.map((it) => ({ ...it, active: isItemActive(it, pathname) }))
                                    }}
                                    isActive={hasActive}
                                    onMouseEnter={cancelClose}
                                    onKeyDown={(e) => onPanelKeyDown(e, g.id)}
                                    onSelect={(item) => {
                                        if (item.external && item.url) window.open(item.url, item.target ? '_blank' : '_self')
                                        else if (item.url) navigate(item.url)
                                        close()
                                    }}
                                />
                            )}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

export default TopNav
