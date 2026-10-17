import PropTypes from 'prop-types'
import { useState, useMemo } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import MainCard from '@/ui-component/cards/MainCard'
import { CHANNELS, CHANNEL_ORDER } from '@/views/omnichannel/mockConversations'
import { useLanguage } from '@/store/context/LanguageContext'
import { translate } from '@/i18n'

const RANGES = [
    { id: '24h', label: '24 giờ' },
    { id: '7d', label: '7 ngày' },
    { id: '30d', label: '30 ngày' }
]

const CustomTooltip = ({ active, payload, label, theme }) => {
    if (!active || !payload?.length) return null
    const total = payload.reduce((s, p) => s + (p.value || 0), 0)
    return (
        <Box
            sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                p: 1.25,
                minWidth: 200,
                boxShadow: theme.shadows[3]
            }}
        >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {label} · {translate('Tổng {n}', { n: total })}
            </Typography>
            <Stack spacing={0.5} mt={0.75}>
                {[...payload]
                    .sort((a, b) => (b.value || 0) - (a.value || 0))
                    .slice(0, 5)
                    .map((p) => (
                        <Stack key={p.dataKey} direction='row' alignItems='center' spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: p.color }} />
                            <Typography variant='caption' sx={{ flex: 1, color: 'text.primary' }}>
                                {CHANNELS[p.dataKey]?.label || p.dataKey}
                            </Typography>
                            <Typography variant='caption' sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                {p.value}
                            </Typography>
                        </Stack>
                    ))}
            </Stack>
        </Box>
    )
}
CustomTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, label: PropTypes.string, theme: PropTypes.object }

const ChannelStackedAreaChart = ({ data }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const [range, setRange] = useState('24h')

    const gradients = useMemo(
        () =>
            CHANNEL_ORDER.map((ch) => ({
                id: `gr-${ch}`,
                color: CHANNELS[ch].color
            })),
        []
    )

    return (
        <MainCard border contentSX={{ p: 2 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{t('Cuộc thoại theo kênh')}</Typography>
                <ToggleButtonGroup
                    size='small'
                    exclusive
                    value={range}
                    onChange={(_, v) => v && setRange(v)}
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            border: `1px solid ${theme.palette.divider}`,
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.spectrum.orange.main, 0.1),
                                color: 'text.primary',
                                borderColor: alpha(theme.palette.spectrum.orange.main, 0.3)
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
            </Stack>
            <Box sx={{ height: 380, mx: -1 }}>
                <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                    <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                            {gradients.map((g) => (
                                <linearGradient key={g.id} id={g.id} x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor={g.color} stopOpacity={0.55} />
                                    <stop offset='100%' stopColor={g.color} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke={alpha(theme.palette.text.primary, 0.06)} vertical={false} />
                        <XAxis
                            dataKey='hour'
                            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                            axisLine={false}
                            tickLine={false}
                            interval={2}
                        />
                        <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip theme={theme} />} />
                        {CHANNEL_ORDER.map((ch) => (
                            <Area
                                isAnimationActive={false}
                                key={ch}
                                type='monotone'
                                dataKey={ch}
                                stackId='1'
                                stroke={CHANNELS[ch].color}
                                strokeWidth={1}
                                fill={`url(#gr-${ch})`}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
            <Stack direction='row' flexWrap='wrap' gap={0.75} mt={2}>
                {CHANNEL_ORDER.map((ch) => {
                    const color = CHANNELS[ch].color
                    return (
                        <Box
                            key={ch}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.375,
                                borderRadius: 1,
                                bgcolor: alpha(color, 0.1),
                                border: `1px solid ${alpha(color, 0.25)}`,
                                color: 'text.primary',
                                fontSize: '0.6875rem',
                                fontWeight: 500
                            }}
                        >
                            <Box sx={{ width: 6, height: 6, borderRadius: '2px', bgcolor: color }} />
                            {CHANNELS[ch].label}
                        </Box>
                    )
                })}
            </Stack>
        </MainCard>
    )
}

ChannelStackedAreaChart.propTypes = { data: PropTypes.array.isRequired }

export default ChannelStackedAreaChart
