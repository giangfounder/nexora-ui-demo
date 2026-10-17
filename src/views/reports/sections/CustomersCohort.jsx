import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import { useChartPalette } from '../chartTheme'
import { cohortRetention } from '../mockReports'

const CustomersCohort = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const c = useChartPalette()
    const base = c.positive
    const maxWeek = cohortRetention.length
    const cols = `140px 60px repeat(${maxWeek}, 56px)`

    const cellColor = (v) => (v == null ? alpha(theme.palette.text.primary, 0.03) : alpha(base, 0.08 + (v / 100) * 0.7))

    return (
        <SectionShell title={t('Cohort giữ chân')}>
            <Box sx={{ border: `1px solid ${c.grid}`, borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ display: 'inline-block', minWidth: '100%' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: cols, gap: 0.5, mb: 0.5 }}>
                            <Box />
                            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'right', pr: 1 }}>
                                {t('Kích cỡ')}
                            </Typography>
                            {Array.from({ length: maxWeek }).map((_, i) => (
                                <Typography
                                    key={i}
                                    variant='caption'
                                    sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}
                                >
                                    W{i}
                                </Typography>
                            ))}
                        </Box>
                        {cohortRetention.map((row) => (
                            <Box key={row.cohort} sx={{ display: 'grid', gridTemplateColumns: cols, gap: 0.5, mb: 0.5 }}>
                                <Typography variant='caption' sx={{ fontWeight: 500, color: 'text.primary', py: 1 }}>
                                    {t('Tuần {n}', { n: row.week })}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    sx={{ color: 'text.secondary', textAlign: 'right', pr: 1, py: 1, fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {row.size}
                                </Typography>
                                {Array.from({ length: maxWeek }).map((_, w) => {
                                    const v = row.values[w]
                                    return (
                                        <Typography
                                            key={w}
                                            variant='caption'
                                            sx={{
                                                height: 32,
                                                borderRadius: 1,
                                                bgcolor: cellColor(v),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                color: v != null && v > 55 ? theme.palette.getContrastText(base) : 'text.primary',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {v != null ? `${v}%` : ''}
                                        </Typography>
                                    )
                                })}
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 2 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {t('Thấp')}
                    </Typography>
                    {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((o) => (
                        <Box key={o} sx={{ width: 24, height: 12, borderRadius: 0.5, bgcolor: alpha(base, o) }} />
                    ))}
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {t('Cao')}
                    </Typography>
                </Stack>
            </Box>
        </SectionShell>
    )
}

export default CustomersCohort
