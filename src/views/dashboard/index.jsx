import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { useLanguage } from '@/store/context/LanguageContext'
import { mockConversations, CHANNELS, CHANNEL_ORDER } from '@/views/omnichannel/mockConversations'
import { mockCustomers } from '@/views/customers/mockCustomers'
import { generateHourlyChannelData, kpiSparklines, watchlistScores, feedEvents, feedAgo, feedText } from './mockDashboard'
import { DepthCard, IconBadge, Tilt3D, shade, useDepth } from './depth'
import OrbitHero from './OrbitHero'
import Pie3D from './Pie3D'
import IsoBarChart from './IsoBarChart'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const RANGES = [
    { id: '24h', label: '24 giờ', factor: 1 },
    { id: '7d', label: '7 ngày', factor: 6.4 },
    { id: '30d', label: '30 ngày', factor: 25.8 }
]

const SHORT_CHANNEL = {
    facebook: 'Messenger',
    zalo: 'Zalo OA',
    zalo_personal: 'Zalo cá nhân',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    website: 'Website',
    email: 'Email',
    tiktok: 'TikTok',
    shopee: 'Shopee',
    lazada: 'Lazada'
}

const tonePriority = (score) => (score >= 85 ? 'rose' : score >= 70 ? 'amber' : 'teal')

// Tiny smooth area sparkline drawn inline (no chart lib needed at this size).
// Catmull-Rom → cubic Bézier keeps the line soft instead of jagged when the card stretches.
const smoothPath = (pts) =>
    pts.reduce((d, [x, y], i) => {
        if (i === 0) return `M${x} ${y}`
        const [x0, y0] = pts[i - 2] || pts[i - 1]
        const [x1, y1] = pts[i - 1]
        const [x3, y3] = pts[i + 1] || [x, y]
        const c1x = x1 + (x - x0) / 6
        const c1y = y1 + (y - y0) / 6
        const c2x = x - (x3 - x1) / 6
        const c2y = y - (y3 - y1) / 6
        return `${d} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
    }, '')

const Sparkline = ({ points, color, height = 56 }) => {
    const theme = useTheme()
    const w = 160
    const h = height
    const ys = points.map((p) => p.y)
    const min = Math.min(...ys)
    const max = Math.max(...ys)
    const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 4 - ((p.y - min) / (max - min || 1)) * (h - 10)])
    const line = smoothPath(xy)
    const [lx, ly] = xy[xy.length - 1]
    const id = `spark-${color.replace('#', '')}`
    return (
        <svg viewBox={`0 0 ${w} ${h}`} width='100%' height={h} preserveAspectRatio='none' aria-hidden style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={id} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={color} stopOpacity='0.3' />
                    <stop offset='100%' stopColor={color} stopOpacity='0' />
                </linearGradient>
            </defs>
            <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
            <path
                d={line}
                fill='none'
                stroke={color}
                strokeWidth='2.25'
                strokeLinecap='round'
                strokeLinejoin='round'
                vectorEffect='non-scaling-stroke'
            />
            {/* latest value marker */}
            <circle
                cx={lx}
                cy={ly}
                r='3.5'
                fill={theme.palette.background.paper}
                stroke={color}
                strokeWidth='2'
                vectorEffect='non-scaling-stroke'
            />
        </svg>
    )
}

Sparkline.propTypes = { points: PropTypes.array.isRequired, color: PropTypes.string.isRequired, height: PropTypes.number }

const SectionTitle = ({ children, action }) => (
    <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' useFlexGap gap={1.5} sx={{ mb: 2 }}>
        <Typography variant='h3' component='h2'>
            {children}
        </Typography>
        {action}
    </Stack>
)

SectionTitle.propTypes = { children: PropTypes.node, action: PropTypes.node }

// ==============================|| DASHBOARD ||============================== //

const Dashboard = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { t, locale } = useLanguage()
    const d = useDepth()
    const [range, setRange] = useState('24h')

    const statusCount = (s) => mockConversations.filter((c) => c.status === s).length
    const openCount = mockConversations.filter((c) => c.status !== 'resolved').length
    const escalated = statusCount('escalated')
    const autoPct = Math.round((statusCount('ai_handling') / mockConversations.length) * 100)

    const hourly = useMemo(() => generateHourlyChannelData(), [])
    const factor = RANGES.find((r) => r.id === range)?.factor || 1
    const channelBars = useMemo(
        () =>
            CHANNEL_ORDER.map((ch) => {
                const base = hourly.reduce((s, row) => s + row[ch], 0)
                const brand = CHANNELS[ch].color
                return {
                    key: ch,
                    label: t(SHORT_CHANNEL[ch] || CHANNELS[ch].label),
                    value: Math.round(base * factor),
                    // near-black brand marks would vanish on the dark theme
                    color: d.isDark && ['tiktok', 'lazada'].includes(ch) ? '#94A3B8' : brand
                }
            }).sort((a, b) => b.value - a.value),
        [hourly, factor, d.isDark, t]
    )
    const totalConversations = channelBars.reduce((s, b) => s + b.value, 0)

    const statusSlices = [
        { key: 'escalated', label: 'Cần xử lý', value: escalated, color: '#F43F5E' },
        { key: 'ai_handling', label: 'Tự động', value: statusCount('ai_handling'), color: '#22D3EE' },
        { key: 'resolved', label: 'Đã xong', value: statusCount('resolved'), color: theme.palette.primary.main }
    ]

    const kpis = [
        {
            label: 'Tỉ lệ trả lời tự động',
            value: `${autoPct}%`,
            delta: 5,
            icon: iconComponent('Lightning'),
            color: '#0EA5E9',
            spark: kpiSparklines.pulse
        },
        {
            label: 'Thời gian phản hồi TB',
            value: '2m 14s',
            delta: -8,
            invertColor: true,
            icon: iconComponent('Clock'),
            color: '#8B5CF6',
            spark: kpiSparklines.response
        },
        {
            label: 'Đã xử lý hôm nay',
            value: statusCount('resolved') * 9,
            delta: 12,
            icon: iconComponent('CheckCircle'),
            color: '#10B981',
            spark: kpiSparklines.open
        },
        {
            label: 'Khách hàng mới (7 ngày)',
            value: mockCustomers.length,
            delta: 24,
            icon: iconComponent('UserPlus'),
            color: theme.palette.primary.main,
            spark: kpiSparklines.newCustomers
        }
    ]

    const priorityRows = useMemo(
        () =>
            Object.entries(watchlistScores)
                .map(([id, meta]) => {
                    const c = mockCustomers.find((x) => x.id === id)
                    return c ? { customer: c, ...meta } : null
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score),
        []
    )

    const toneColor = (tone) => theme.palette.spectrum?.[tone]?.main || theme.palette.warning.main

    return (
        <Box>
            <ViewHeader title={t('Tổng quan')} />

            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2, md: 2.5 },
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                    '& > *': { minWidth: 0 },
                    '@keyframes dashRise': {
                        from: { opacity: 0, transform: 'translateY(14px)' },
                        to: { opacity: 1, transform: 'none' }
                    },
                    '& > .rise': { animation: 'dashRise 560ms cubic-bezier(0.22, 1, 0.36, 1) both' },
                    '@media (prefers-reduced-motion: reduce)': { '& > .rise': { animation: 'none' } }
                }}
            >
                {/* Hero */}
                <Box className='rise' sx={{ gridColumn: { md: 'span 8' } }}>
                    <OrbitHero
                        t={t}
                        openCount={openCount}
                        needsHuman={escalated}
                        channels={CHANNEL_ORDER}
                        onOpenInbox={() => navigate('/omnichannel')}
                    />
                </Box>

                {/* Status 3D pie */}
                <Box className='rise' sx={{ gridColumn: { md: 'span 4' }, animationDelay: '60ms' }}>
                    <Tilt3D max={5} sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h3' component='h2' sx={{ mb: 0.5 }}>
                            {t('Trạng thái hội thoại')}
                        </Typography>
                        <Typography variant='caption'>{t('{n} cuộc thoại hôm nay', { n: mockConversations.length })}</Typography>
                        <Box sx={{ flex: 1, mt: 1.5, transform: 'translateZ(24px)' }}>
                            <Pie3D data={statusSlices} t={t} />
                        </Box>
                    </Tilt3D>
                </Box>

                {/* KPI tiles — 2×2 on medium screens, one row from lg */}
                {kpis.map((k, i) => {
                    const positive = k.invertColor ? k.delta < 0 : k.delta > 0
                    const deltaColor = positive ? theme.palette.success.main : theme.palette.error.main
                    return (
                        <Box
                            key={k.label}
                            className='rise'
                            sx={{ gridColumn: { md: 'span 6', lg: 'span 3' }, animationDelay: `${120 + i * 50}ms` }}
                        >
                            <Tilt3D max={5} sx={{ p: 2.5, display: 'flex', alignItems: 'stretch', gap: 2 }}>
                                <Stack justifyContent='space-between' spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction='row' alignItems='center' spacing={1.25} sx={{ minWidth: 0 }}>
                                        <IconBadge icon={k.icon} color={k.color} size={38} />
                                        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.3 }}>
                                            {t(k.label)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction='row' alignItems='baseline' spacing={1} flexWrap='wrap' useFlexGap>
                                        <Typography
                                            sx={{
                                                fontFamily: `'Space Grotesk', 'Inter', sans-serif`,
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                letterSpacing: '-0.02em',
                                                color: 'text.primary',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {k.value}
                                        </Typography>
                                        <Box
                                            component='span'
                                            sx={{
                                                px: 0.75,
                                                height: 22,
                                                borderRadius: '999px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.25,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: deltaColor,
                                                bgcolor: alpha(deltaColor, 0.1),
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {k.delta > 0 ? '▲' : '▼'} {Math.abs(k.delta)}%
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Box sx={{ width: '40%', maxWidth: 180, minWidth: 96, alignSelf: 'flex-end', pb: 0.5 }}>
                                    <Sparkline points={k.spark} color={k.color} height={56} />
                                </Box>
                            </Tilt3D>
                        </Box>
                    )
                })}

                {/* Channels — isometric bars */}
                <Box className='rise' sx={{ gridColumn: { md: 'span 12' }, animationDelay: '320ms' }}>
                    <DepthCard sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle
                            action={
                                <ToggleButtonGroup
                                    size='small'
                                    exclusive
                                    value={range}
                                    onChange={(_, v) => v && setRange(v)}
                                    aria-label={t('Khoảng thời gian')}
                                    sx={{
                                        p: 0.5,
                                        gap: 0.5,
                                        borderRadius: '12px',
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        '& .MuiToggleButton-root': {
                                            border: 0,
                                            borderRadius: '9px !important',
                                            px: 1.5,
                                            whiteSpace: 'nowrap',
                                            typography: 'tabItem',
                                            fontSize: '0.8125rem',
                                            color: 'text.primary',
                                            '&.Mui-selected': {
                                                bgcolor: 'background.paper',
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                boxShadow: theme.customShadows?.xs,
                                                '&:hover': { bgcolor: 'background.paper' }
                                            }
                                        }
                                    }}
                                >
                                    {RANGES.map((r) => (
                                        <ToggleButton key={r.id} value={r.id}>
                                            {t(r.label)}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            }
                        >
                            {t('Cuộc thoại theo kênh')}
                            <Typography
                                component='span'
                                variant='body2'
                                sx={{ ml: 1.25, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                            >
                                {t('{n} cuộc', { n: totalConversations.toLocaleString(locale) })}
                            </Typography>
                        </SectionTitle>
                        <IsoBarChart data={channelBars} t={t} />
                    </DepthCard>
                </Box>

                {/* Needs attention */}
                <Box className='rise' sx={{ gridColumn: { md: 'span 7' }, animationDelay: '380ms' }}>
                    <DepthCard sx={{ height: '100%' }}>
                        <Box sx={{ px: 3, pt: 2.5 }}>
                            <SectionTitle
                                action={
                                    <Box
                                        component='span'
                                        sx={{
                                            px: 1,
                                            height: 24,
                                            borderRadius: '999px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: theme.palette.error.main,
                                            bgcolor: alpha(theme.palette.error.main, 0.1)
                                        }}
                                    >
                                        {priorityRows.length}
                                    </Box>
                                }
                            >
                                {t('Cần xử lý ngay')}
                            </SectionTitle>
                        </Box>
                        <Stack sx={{ px: 1.5, pb: 1.5 }} spacing={0.5}>
                            {priorityRows.map(({ customer, score, reason, reasonVars }) => {
                                const tone = toneColor(tonePriority(score))
                                return (
                                    <ButtonBase
                                        key={customer.id}
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textAlign: 'left',
                                            gap: 1.5,
                                            px: 1.5,
                                            py: 1.25,
                                            borderRadius: '12px',
                                            transition: 'background-color 150ms ease-out, transform 150ms ease-out',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), transform: 'translateX(2px)' },
                                            '&:hover .row-go': { opacity: 1, transform: 'none' },
                                            '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                        }}
                                    >
                                        {/* score ring */}
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                flexShrink: 0,
                                                display: 'grid',
                                                placeItems: 'center',
                                                background: `conic-gradient(${tone} ${score * 3.6}deg, ${alpha(tone, 0.14)} 0)`,
                                                boxShadow: `0 6px 14px -8px ${alpha(tone, 0.8)}`
                                            }}
                                        >
                                            <PersonAvatar name={customer.name} size={32} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                                                {customer.name}
                                            </Typography>
                                            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.8125rem' }} noWrap>
                                                {t(reason, reasonVars)}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            sx={{ fontWeight: 700, color: tone, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}
                                        >
                                            {score}
                                        </Typography>
                                        <Box
                                            className='row-go'
                                            sx={{
                                                display: 'flex',
                                                color: 'primary.main',
                                                opacity: 0.35,
                                                transform: 'translateX(-4px)',
                                                transition: 'all 150ms ease-out'
                                            }}
                                        >
                                            <AppIcon name='CaretRight' size={18} />
                                        </Box>
                                    </ButtonBase>
                                )
                            })}
                        </Stack>
                    </DepthCard>
                </Box>

                {/* Activity */}
                <Box className='rise' sx={{ gridColumn: { md: 'span 5' }, animationDelay: '440ms' }}>
                    <DepthCard sx={{ height: '100%' }}>
                        <Box sx={{ px: 3, pt: 2.5 }}>
                            <SectionTitle>{t('Hoạt động')}</SectionTitle>
                        </Box>
                        <Box sx={{ px: 3, pb: 2.5, position: 'relative' }}>
                            {/* timeline spine */}
                            <Box
                                sx={{ position: 'absolute', left: 30, top: 8, bottom: 28, width: 2, bgcolor: d.hairline, borderRadius: 1 }}
                            />
                            <Stack spacing={1.75}>
                                {feedEvents.slice(0, 6).map((ev) => {
                                    const c = toneColor(ev.tone)
                                    return (
                                        <Stack
                                            key={ev.id}
                                            direction='row'
                                            spacing={1.75}
                                            alignItems='flex-start'
                                            sx={{ position: 'relative' }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    mt: 0.375,
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    background: `radial-gradient(circle at 35% 30%, ${shade(
                                                        c.startsWith('#') ? c : '#2563EB',
                                                        0.4
                                                    )}, ${c})`,
                                                    boxShadow: `0 0 0 3px ${theme.palette.background.paper}, 0 4px 10px -2px ${alpha(
                                                        c,
                                                        0.6
                                                    )}`,
                                                    zIndex: 1
                                                }}
                                            />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                                                    {feedText(t, ev, locale)}
                                                </Typography>
                                                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                                    {feedAgo(t, ev)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )
                                })}
                            </Stack>
                        </Box>
                    </DepthCard>
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard
