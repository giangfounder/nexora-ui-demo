import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import Tag from './Tag'
import { useChartPalette } from '../chartTheme'
import { lifecycleFunnel } from '../mockReports'

const CustomersLifecycle = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const c = useChartPalette()
    const max = lifecycleFunnel[0].count

    return (
        <SectionShell title={t('Vòng đời khách hàng')}>
            <Box sx={{ border: `1px solid ${c.grid}`, borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>
                <Stack spacing={2}>
                    {lifecycleFunnel.map((stage, i) => {
                        const tone = c.tone(stage.tone)
                        const prev = i > 0 ? lifecycleFunnel[i - 1].count : stage.count
                        const conv = i === 0 ? 100 : (stage.count / prev) * 100
                        return (
                            <Box key={stage.stage}>
                                <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 0.75 }}>
                                    <Stack direction='row' alignItems='center' spacing={1}>
                                        <Typography
                                            variant='caption'
                                            sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', minWidth: 16 }}
                                        >
                                            {i + 1}
                                        </Typography>
                                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                            {t(stage.stage)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction='row' spacing={1.5} alignItems='center'>
                                        <Tag label={`${conv.toFixed(1)}%`} tone={tone} />
                                        <Typography variant='h4' component='span' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {stage.count.toLocaleString(locale)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Box sx={{ height: 8, borderRadius: 1, bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
                                    <Box sx={{ height: '100%', width: `${(stage.count / max) * 100}%`, borderRadius: 1, bgcolor: tone }} />
                                </Box>
                            </Box>
                        )
                    })}
                </Stack>
            </Box>
        </SectionShell>
    )
}

export default CustomersLifecycle
