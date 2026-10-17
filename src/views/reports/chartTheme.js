import { createElement as h } from 'react'
import PropTypes from 'prop-types'
import { alpha, getLuminance, lighten, useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { CHANNELS } from '@/views/omnichannel/mockConversations'

export const useChartPalette = () => {
    const theme = useTheme()
    const s = theme.palette.spectrum
    const fallback = s.orange.main
    const isDark = theme.palette.mode === 'dark'
    // near-black brand marks (TikTok, Lazada) would vanish on dark surfaces
    const readable = (color) => (isDark && getLuminance(color) < 0.05 ? lighten(color, 0.55) : color)
    return {
        tone: (key) => s[key]?.main || fallback,
        channel: (key) => readable(CHANNELS[key]?.color || fallback),
        primary: s.orange.main,
        secondary: s.teal.main,
        positive: s.emerald.main,
        neutral: s.teal.main,
        negative: s.rose.main,
        warning: s.amber.main,
        grid: theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08),
        cursor: { fill: alpha(theme.palette.text.primary, 0.04) },
        tick: { fontSize: 11, fill: theme.palette.text.secondary },
        legend: { fontSize: 12 }
    }
}

export const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
    const theme = useTheme()
    if (!active || !payload?.length) return null
    const border = theme.palette.alpha?.border || theme.palette.divider
    const title = label === '' ? null : label

    return h(
        Box,
        {
            sx: {
                bgcolor: 'background.paper',
                border: `1px solid ${border}`,
                borderRadius: '6px',
                px: 1.25,
                py: 1,
                fontSize: 12,
                minWidth: 120
            }
        },
        title != null && h(Typography, { component: 'div', sx: { fontSize: 12, fontWeight: 600, mb: 0.5 } }, title),
        payload.map((item, i) =>
            h(
                Box,
                {
                    key: `${item.dataKey ?? item.name}-${i}`,
                    sx: { display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, lineHeight: 1.6 }
                },
                h(Box, {
                    component: 'span',
                    sx: { width: 8, height: 8, borderRadius: '2px', flexShrink: 0, bgcolor: item.color || item.payload?.fill || item.fill }
                }),
                h(Box, { component: 'span', sx: { color: 'text.secondary', flex: 1 } }, item.name),
                h(
                    Box,
                    { component: 'span', sx: { fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'text.primary' } },
                    valueFormatter ? valueFormatter(item.value, item) : item.value
                )
            )
        )
    )
}

ChartTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    valueFormatter: PropTypes.func
}
