import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import ViewHeader from '@/layout/MainLayout/ViewHeader'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'
import { useLanguage } from '@/store/context/LanguageContext'
import { mockConversations, CHANNELS, CHANNEL_ORDER, HANDOFF_TAGS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'
import { mockCustomers } from '@/views/customers/mockCustomers'
import { generateHourlyChannelData, kpiSparklines, watchlistScores, feedEvents, feedAgo, feedText } from './mockDashboard'

// "Bảng đến": the dashboard reads like a station arrivals board. Conversations arrive, the board says
// when, from whom, on which channel, why a person is needed, and what state it is in.
const SIGN_FONT = `'Barlow Semi Condensed', 'Be Vietnam Pro', 'Segoe UI', sans-serif`

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

// State is a glyph plus a word; colour only reinforces it.
const CONVERSATION_STATE = {
    escalated: { label: 'Cần xử lý', icon: 'WarningCircle', tone: 'error' },
    ai_handling: { label: 'Tự động', icon: 'Robot', tone: 'primary' },
    resolved: { label: 'Đã xong', icon: 'CheckCircle', tone: 'success' }
}

const Panel = ({ children, sx }) => (
    <Box
        sx={(theme) => ({
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: '8px',
            ...(typeof sx === 'function' ? sx(theme) : sx)
        })}
    >
        {children}
    </Box>
)

Panel.propTypes = { children: PropTypes.node, sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func]) }

const SectionTitle = ({ children, action }) => (
    <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ mb: 2 }}>
        <Typography variant='h3' component='h2'>
            {children}
        </Typography>
        {action}
    </Stack>
)

SectionTitle.propTypes = { children: PropTypes.node, action: PropTypes.node }

// One-colour sparkline: shape only, no fill and no per-card hue.
const Sparkline = ({ points, height = 36 }) => {
    const theme = useTheme()
    const w = 120
    const ys = points.map((p) => p.y)
    const min = Math.min(...ys)
    const max = Math.max(...ys)
    const span = max - min || 1
    const pad = 3
    const pts = points.map((p, i) => [(i / (points.length - 1)) * w, pad + (1 - (p.y - min) / span) * (height - pad * 2)])
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    return (
        <svg width='100%' height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio='none' aria-hidden>
            <path
                d={d}
                fill='none'
                stroke={alpha(theme.palette.text.primary, 0.45)}
                strokeWidth='1.5'
                vectorEffect='non-scaling-stroke'
                strokeLinejoin='round'
            />
        </svg>
    )
}

Sparkline.propTypes = { points: PropTypes.array.isRequired, height: PropTypes.number }

const Dashboard = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { t, locale } = useLanguage()
    const [range, setRange] = useState('24h')
    const hairline = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.1)
    const faint = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)

    const statusCount = (s) => mockConversations.filter((c) => c.status === s).length
    const openCount = mockConversations.filter((c) => c.status !== 'resolved').length
    const escalatedList = mockConversations.filter((c) => c.status === 'escalated')
    const autoPct = Math.round((statusCount('ai_handling') / mockConversations.length) * 100)

    const hourly = useMemo(() => generateHourlyChannelData(), [])
    const factor = RANGES.find((r) => r.id === range)?.factor || 1
    const channelBars = useMemo(
        () =>
            CHANNEL_ORDER.map((ch) => ({
                key: ch,
                label: t(SHORT_CHANNEL[ch] || CHANNELS[ch].label),
                value: Math.round(hourly.reduce((s, row) => s + row[ch], 0) * factor)
            })).sort((a, b) => b.value - a.value),
        [hourly, factor, t]
    )
    const totalConversations = channelBars.reduce((s, b) => s + b.value, 0)
    const maxChannel = Math.max(...channelBars.map((b) => b.value), 1)

    const statusRows = ['escalated', 'ai_handling', 'resolved'].map((key) => ({ key, value: statusCount(key), ...CONVERSATION_STATE[key] }))
    const toneMain = (tone) => (tone === 'primary' ? theme.palette.primary.main : theme.palette[tone].main)

    const kpis = [
        { label: 'Tỉ lệ trả lời tự động', value: `${autoPct}%`, delta: 5, spark: kpiSparklines.pulse },
        { label: 'Thời gian phản hồi TB', value: '2m 14s', delta: -8, invertColor: true, spark: kpiSparklines.response },
        { label: 'Đã xử lý hôm nay', value: statusCount('resolved') * 9, delta: 12, spark: kpiSparklines.open },
        { label: 'Khách hàng mới (7 ngày)', value: mockCustomers.length, delta: 24, spark: kpiSparklines.newCustomers }
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

    const feedTone = (tone) => (tone === 'rose' ? 'error' : tone === 'amber' ? 'warning' : tone === 'emerald' ? 'success' : 'primary')
    const feedIcon = (tone) =>
        tone === 'rose' ? 'WarningCircle' : tone === 'amber' ? 'Info' : tone === 'emerald' ? 'CheckCircle' : 'ChatCircle'

    return (
        <Box>
            <ViewHeader title={t('Tổng quan')} />

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                    '& > *': { minWidth: 0 }
                }}
            >
                {/* Arrivals board: the conversations that need a person */}
                <Box sx={{ gridColumn: { md: 'span 8' } }}>
                    <Box
                        sx={{
                            height: '100%',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            bgcolor: '#0E2350',
                            color: '#fff',
                            border: '1px solid #0E2350'
                        }}
                    >
                        <Stack
                            direction='row'
                            alignItems='baseline'
                            justifyContent='space-between'
                            spacing={2}
                            sx={{ px: 2.5, pt: 2.25, pb: 1.5 }}
                        >
                            <Stack direction='row' alignItems='baseline' spacing={1.5}>
                                <Typography
                                    component='h2'
                                    sx={{ fontFamily: SIGN_FONT, fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.2, color: '#fff' }}
                                >
                                    {t('Hàng đợi chuyển người')}
                                </Typography>
                                <Typography sx={{ fontSize: '0.8125rem', color: alpha('#fff', 0.7) }}>
                                    {t('{n} cuộc đang mở', { n: openCount })}
                                </Typography>
                            </Stack>
                            <ButtonBase
                                onClick={() => navigate('/omnichannel')}
                                sx={{
                                    gap: 0.75,
                                    px: 1.5,
                                    height: 32,
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    color: '#0E2350',
                                    bgcolor: '#fff',
                                    '&:hover': { bgcolor: alpha('#fff', 0.88) },
                                    '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: 2 }
                                }}
                            >
                                {t('Mở hộp thư')}
                                <AppIcon name='ArrowRight' size={14} />
                            </ButtonBase>
                        </Stack>

                        <Box sx={{ overflowX: 'auto' }}>
                            <Box sx={{ minWidth: 560 }}>
                                {/* header row */}
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '64px minmax(0, 1.3fr) 110px minmax(0, 1.6fr) 110px',
                                        columnGap: 2,
                                        px: 2.5,
                                        py: 0.875,
                                        borderTop: `1px solid ${alpha('#fff', 0.18)}`,
                                        borderBottom: `1px solid ${alpha('#fff', 0.18)}`,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: alpha('#fff', 0.72)
                                    }}
                                >
                                    <span>{t('Chờ')}</span>
                                    <span>{t('Khách')}</span>
                                    <span>{t('Kênh')}</span>
                                    <span>{t('Lý do chuyển')}</span>
                                    <span>{t('Trạng thái')}</span>
                                </Box>
                                {escalatedList.map((c) => {
                                    const ChannelIcon = getChannelIcon(c.channel)
                                    const reason = HANDOFF_TAGS[c.handoffTag]?.label || c.tag
                                    return (
                                        <ButtonBase
                                            key={c.id}
                                            onClick={() => navigate('/omnichannel')}
                                            sx={{
                                                display: 'grid',
                                                width: '100%',
                                                textAlign: 'left',
                                                gridTemplateColumns: '64px minmax(0, 1.3fr) 110px minmax(0, 1.6fr) 110px',
                                                columnGap: 2,
                                                alignItems: 'center',
                                                px: 2.5,
                                                py: 1.25,
                                                borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
                                                '&:hover': { bgcolor: alpha('#fff', 0.06) },
                                                '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: -2 }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: SIGN_FONT,
                                                    fontWeight: 600,
                                                    fontSize: '1.125rem',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    color: '#F2B233'
                                                }}
                                            >
                                                {c.waitingSince}
                                            </Typography>
                                            <Stack direction='row' alignItems='center' spacing={1.25} sx={{ minWidth: 0 }}>
                                                <PersonAvatar
                                                    name={c.customerName}
                                                    size={28}
                                                    sx={{
                                                        color: '#fff',
                                                        bgcolor: alpha('#fff', 0.1),
                                                        border: `1px solid ${alpha('#fff', 0.28)}`
                                                    }}
                                                />
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }} noWrap>
                                                    {c.customerName}
                                                </Typography>
                                            </Stack>
                                            <Stack direction='row' alignItems='center' spacing={0.75}>
                                                <ChannelIcon size={18} />
                                                <Typography sx={{ fontSize: '0.8125rem', color: alpha('#fff', 0.85) }} noWrap>
                                                    {t(SHORT_CHANNEL[c.channel])}
                                                </Typography>
                                            </Stack>
                                            <Typography sx={{ fontSize: '0.875rem', color: alpha('#fff', 0.92) }} noWrap>
                                                {t(reason)}
                                            </Typography>
                                            <Stack direction='row' alignItems='center' spacing={0.5} sx={{ color: '#F2B233' }}>
                                                <AppIcon name='HourglassMedium' size={16} />
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F2B233' }}>
                                                    {t('Chờ nhận')}
                                                </Typography>
                                            </Stack>
                                        </ButtonBase>
                                    )
                                })}
                                {escalatedList.length === 0 && (
                                    <Typography sx={{ px: 2.5, py: 3, color: alpha('#fff', 0.8) }}>
                                        {t('Không có cuộc nào cần người xử lý.')}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Conversation state */}
                <Box sx={{ gridColumn: { md: 'span 4' } }}>
                    <Panel sx={{ height: '100%', p: 2.5 }}>
                        <SectionTitle>{t('Trạng thái hội thoại')}</SectionTitle>
                        <Typography variant='caption' sx={{ display: 'block', mb: 1.5 }}>
                            {t('{n} cuộc thoại hôm nay', { n: mockConversations.length })}
                        </Typography>
                        <Stack spacing={0}>
                            {statusRows.map((s, i) => (
                                <Stack
                                    key={s.key}
                                    direction='row'
                                    alignItems='center'
                                    spacing={1.25}
                                    sx={{ py: 1.25, borderTop: i ? `1px solid ${faint}` : 0 }}
                                >
                                    <Box sx={{ display: 'inline-flex', color: toneMain(s.tone) }}>
                                        <AppIcon name={s.icon} size={20} />
                                    </Box>
                                    <Typography variant='body2' sx={{ flex: 1, fontWeight: 500 }}>
                                        {t(s.label)}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: SIGN_FONT,
                                            fontWeight: 600,
                                            fontSize: '1.5rem',
                                            lineHeight: 1,
                                            fontVariantNumeric: 'tabular-nums'
                                        }}
                                    >
                                        {s.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Panel>
                </Box>

                {/* Key figures: station-board numerals, no icon tiles */}
                <Box sx={{ gridColumn: { md: 'span 12' } }}>
                    <Panel
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }
                        }}
                    >
                        {kpis.map((k, i) => {
                            const positive = k.invertColor ? k.delta < 0 : k.delta > 0
                            const deltaColor = positive ? theme.palette.success.main : theme.palette.error.main
                            return (
                                <Box
                                    key={k.label}
                                    sx={{
                                        p: 2.5,
                                        borderLeft: { xs: i % 2 ? `1px solid ${hairline}` : 0, lg: i ? `1px solid ${hairline}` : 0 },
                                        borderTop: { xs: i > 1 ? `1px solid ${hairline}` : 0, lg: 0 }
                                    }}
                                >
                                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                                        {t(k.label)}
                                    </Typography>
                                    <Stack direction='row' alignItems='flex-end' justifyContent='space-between' spacing={1.5}>
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontFamily: SIGN_FONT,
                                                    fontSize: '2.25rem',
                                                    fontWeight: 600,
                                                    lineHeight: 1,
                                                    color: 'text.primary',
                                                    fontVariantNumeric: 'tabular-nums'
                                                }}
                                            >
                                                {k.value}
                                            </Typography>
                                            <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.75, color: deltaColor }}>
                                                <AppIcon name={k.delta > 0 ? 'TrendUp' : 'TrendDown'} size={16} />
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 600,
                                                        color: deltaColor,
                                                        fontVariantNumeric: 'tabular-nums'
                                                    }}
                                                >
                                                    {Math.abs(k.delta)}%
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <Box sx={{ width: '45%', maxWidth: 130, minWidth: 80 }}>
                                            <Sparkline points={k.spark} />
                                        </Box>
                                    </Stack>
                                </Box>
                            )
                        })}
                    </Panel>
                </Box>

                {/* Channels: flat bars, each channel by its own mark */}
                <Box sx={{ gridColumn: { md: 'span 12' } }}>
                    <Panel sx={{ p: { xs: 2, md: 2.5 } }}>
                        <SectionTitle
                            action={
                                <ToggleButtonGroup
                                    size='small'
                                    exclusive
                                    value={range}
                                    onChange={(_, v) => v && setRange(v)}
                                    aria-label={t('Khoảng thời gian')}
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            px: 1.5,
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.8125rem',
                                            color: 'text.primary',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: '#fff',
                                                '&:hover': { bgcolor: 'primary.dark' }
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
                        <Stack spacing={0}>
                            {channelBars.map((b, i) => {
                                const ChannelIcon = getChannelIcon(b.key)
                                return (
                                    <Stack
                                        key={b.key}
                                        direction='row'
                                        alignItems='center'
                                        spacing={1.5}
                                        sx={{ py: 0.875, borderTop: i ? `1px solid ${faint}` : 0 }}
                                    >
                                        <Stack
                                            direction='row'
                                            alignItems='center'
                                            spacing={1}
                                            sx={{ width: { xs: 120, md: 160 }, flexShrink: 0 }}
                                        >
                                            <ChannelIcon size={20} />
                                            <Typography variant='body2' noWrap>
                                                {b.label}
                                            </Typography>
                                        </Stack>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                height: 10,
                                                bgcolor: alpha(theme.palette.text.primary, 0.06),
                                                borderRadius: '2px'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(b.value / maxChannel) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: i === 0 ? 'primary.main' : alpha(theme.palette.primary.main, 0.45),
                                                    borderRadius: '2px'
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            sx={{
                                                width: 56,
                                                textAlign: 'right',
                                                fontFamily: SIGN_FONT,
                                                fontWeight: 600,
                                                fontSize: '1.0625rem',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {b.value.toLocaleString(locale)}
                                        </Typography>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    </Panel>
                </Box>

                {/* Needs attention */}
                <Box sx={{ gridColumn: { md: 'span 7' } }}>
                    <Panel sx={{ height: '100%' }}>
                        <Box sx={{ px: 2.5, pt: 2.5 }}>
                            <SectionTitle
                                action={
                                    <Typography
                                        sx={{
                                            fontFamily: SIGN_FONT,
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            fontVariantNumeric: 'tabular-nums'
                                        }}
                                    >
                                        {priorityRows.length}
                                    </Typography>
                                }
                            >
                                {t('Cần xử lý ngay')}
                            </SectionTitle>
                        </Box>
                        <Stack sx={{ px: 1, pb: 1 }}>
                            {priorityRows.map(({ customer, score, reason, reasonVars }) => {
                                const urgent = score >= 85
                                const tone = urgent
                                    ? theme.palette.error.main
                                    : score >= 70
                                    ? theme.palette.warning.dark
                                    : theme.palette.text.secondary
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
                                            borderRadius: '6px',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                            '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                        }}
                                    >
                                        <PersonAvatar name={customer.name} size={32} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                                                {customer.name}
                                            </Typography>
                                            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.8125rem' }} noWrap>
                                                {t(reason, reasonVars)}
                                            </Typography>
                                        </Box>
                                        <Stack direction='row' alignItems='center' spacing={0.5} sx={{ color: tone }}>
                                            <AppIcon name={urgent ? 'WarningOctagon' : score >= 70 ? 'WarningCircle' : 'Info'} size={16} />
                                            <Typography
                                                sx={{
                                                    fontFamily: SIGN_FONT,
                                                    fontWeight: 600,
                                                    fontSize: '1.125rem',
                                                    color: tone,
                                                    fontVariantNumeric: 'tabular-nums'
                                                }}
                                            >
                                                {score}
                                            </Typography>
                                        </Stack>
                                        <AppIcon name='CaretRight' size={16} />
                                    </ButtonBase>
                                )
                            })}
                        </Stack>
                    </Panel>
                </Box>

                {/* Activity: newest on top, one direction of time */}
                <Box sx={{ gridColumn: { md: 'span 5' } }}>
                    <Panel sx={{ height: '100%' }}>
                        <Box sx={{ px: 2.5, pt: 2.5 }}>
                            <SectionTitle>{t('Hoạt động')}</SectionTitle>
                        </Box>
                        <Stack sx={{ px: 2.5, pb: 2.5 }} spacing={1.75}>
                            {feedEvents.slice(0, 6).map((ev) => {
                                const tone = feedTone(ev.tone)
                                return (
                                    <Stack key={ev.id} direction='row' spacing={1.25} alignItems='flex-start'>
                                        <Box sx={{ display: 'inline-flex', mt: 0.125, color: toneMain(tone) }}>
                                            <AppIcon name={feedIcon(ev.tone)} size={18} />
                                        </Box>
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
                    </Panel>
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard
