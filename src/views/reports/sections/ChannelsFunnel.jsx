import { useState } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material'
import { useLanguage } from '@/store/context/LanguageContext'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import SectionShell from './SectionShell'
import { useChartPalette } from '../chartTheme'
import { channelFunnel } from '../mockReports'

const ChannelsFunnel = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const c = useChartPalette()
    const [channel, setChannel] = useState('facebook')
    const data = channelFunnel[channel] || []
    const max = data[0]?.count || 1
    const color = c.channel(channel)

    return (
        <SectionShell title={t('Funnel theo kênh')}>
            <Box sx={{ border: `1px solid ${c.grid}`, borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>
                <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {t('Kênh')}
                    </Typography>
                    <Select size='small' value={channel} onChange={(e) => setChannel(e.target.value)} sx={{ minWidth: 220 }}>
                        {Object.keys(channelFunnel).map((key) => (
                            <MenuItem key={key} value={key}>
                                {CHANNELS[key].label}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>

                <Stack spacing={1.5}>
                    {data.map((stage, i) => {
                        const prev = i > 0 ? data[i - 1].count : stage.count
                        const conv = i === 0 ? 100 : (stage.count / prev) * 100
                        return (
                            <Box key={stage.stage}>
                                <Stack direction='row' alignItems='baseline' justifyContent='space-between' sx={{ mb: 0.5 }}>
                                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                        {t(stage.stage)}
                                    </Typography>
                                    <Stack direction='row' spacing={1.5} alignItems='baseline'>
                                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                            {conv.toFixed(1)}%
                                        </Typography>
                                        <Typography variant='h4' component='span' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {stage.count.toLocaleString(locale)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Box sx={{ height: 8, borderRadius: 1, bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
                                    <Box sx={{ height: '100%', width: `${(stage.count / max) * 100}%`, borderRadius: 1, bgcolor: color }} />
                                </Box>
                            </Box>
                        )
                    })}
                </Stack>
            </Box>
        </SectionShell>
    )
}

export default ChannelsFunnel
