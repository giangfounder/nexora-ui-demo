import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, Typography } from '@mui/material'

import { headerHeight } from '@/store/constant'

const SubNav = ({ items, value, onChange, ariaLabel, sticky = true }) => {
    const theme = useTheme()
    const barRef = useRef(null)
    const itemRefs = useRef({})
    const [indicator, setIndicator] = useState(null)

    useLayoutEffect(() => {
        const el = itemRefs.current[value]
        const bar = barRef.current
        if (!el || !bar) return undefined
        const measure = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
        measure()
        el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        const ro = new ResizeObserver(measure)
        ro.observe(bar)
        return () => ro.disconnect()
    }, [value, items])

    const onKeyDown = (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const idx = items.findIndex((it) => it.key === value)
        const next = items[(idx + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length]
        onChange(next.key)
        requestAnimationFrame(() => itemRefs.current[next.key]?.focus())
    }

    const orange = theme.palette.primary.main
    const hairline = alpha(theme.palette.text.primary, 0.08)

    return (
        <Box
            sx={{
                ...(sticky && { position: 'sticky', top: headerHeight, zIndex: 4 }),
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${hairline}`,
                mb: 3
            }}
        >
            <Box
                ref={barRef}
                role='tablist'
                aria-label={ariaLabel}
                onKeyDown={onKeyDown}
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    py: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' }
                }}
            >
                {indicator && (
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            top: 8,
                            bottom: 8,
                            left: indicator.left,
                            width: indicator.width,
                            borderRadius: 999,
                            bgcolor: alpha(orange, 0.1),
                            transition: 'left 220ms cubic-bezier(0.22, 1, 0.36, 1), width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                            '@media (prefers-reduced-motion: reduce)': { transition: 'none' }
                        }}
                    />
                )}
                {items.map((it, i) => {
                    const Icon = it.icon
                    const active = it.key === value
                    const startsGroup = it.group && it.group !== items[i - 1]?.group
                    return (
                        <Fragment key={it.key}>
                            {startsGroup && (
                                <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: i === 0 ? 0.5 : 1.5, pr: 0.5, flexShrink: 0 }}
                                >
                                    {i > 0 && <Box sx={{ width: '1px', height: 20, bgcolor: hairline, mr: 1 }} />}
                                    <Typography component='span' sx={{ typography: 'eyebrow', color: 'text.secondary' }}>
                                        {it.group}
                                    </Typography>
                                </Box>
                            )}
                            <ButtonBase
                                ref={(el) => {
                                    itemRefs.current[it.key] = el
                                }}
                                role='tab'
                                aria-selected={active}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onChange(it.key)}
                                sx={{
                                    position: 'relative',
                                    zIndex: 1,
                                    flexShrink: 0,
                                    gap: 0.75,
                                    height: 36,
                                    px: 1.75,
                                    borderRadius: 999,
                                    typography: 'tabItem',
                                    fontWeight: active ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                    color: active ? orange : 'text.primary',
                                    transition: 'color 150ms ease-out, background-color 150ms ease-out',
                                    '&:hover': {
                                        color: active ? orange : 'grey.900',
                                        bgcolor: active ? 'transparent' : alpha(theme.palette.text.primary, 0.04)
                                    },
                                    '&:hover .subnav-icon': { transform: active ? 'none' : 'translateY(-1px)' },
                                    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                }}
                            >
                                {Icon && (
                                    <Box className='subnav-icon' sx={{ display: 'flex', transition: 'transform 150ms ease-out' }}>
                                        <Icon size={17} stroke={active ? 2 : 1.75} />
                                    </Box>
                                )}
                                {it.label}
                            </ButtonBase>
                        </Fragment>
                    )
                })}
            </Box>
        </Box>
    )
}

SubNav.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            icon: PropTypes.elementType,
            group: PropTypes.string
        })
    ).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    ariaLabel: PropTypes.string,
    sticky: PropTypes.bool
}

export default SubNav
