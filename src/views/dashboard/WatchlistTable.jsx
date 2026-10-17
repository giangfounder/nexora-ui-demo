import { useNavigate } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'
import { mockCustomers } from '@/views/customers/mockCustomers'
import { watchlistScores } from './mockDashboard'
import { useLanguage } from '@/store/context/LanguageContext'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const scoreTone = (score) => {
    if (score >= 85) return 'rose'
    if (score >= 70) return 'orange'
    if (score >= 50) return 'amber'
    return 'teal'
}

const WatchlistTable = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { t } = useLanguage()

    const rows = Object.entries(watchlistScores)
        .map(([id, meta]) => {
            const c = mockCustomers.find((x) => x.id === id)
            return c ? { customer: c, ...meta } : null
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    return (
        <MainCard border contentSX={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5 }}>{t('Khách cần chú ý')}</Typography>
            <Stack>
                {rows.map(({ customer, score, reason, reasonVars }, i) => {
                    const tone = theme.palette.spectrum[scoreTone(score)].main
                    return (
                        <Stack
                            key={customer.id}
                            direction='row'
                            alignItems='center'
                            spacing={1.25}
                            onClick={() => navigate(`/customers/${customer.id}`)}
                            sx={{
                                height: 40,
                                cursor: 'pointer',
                                borderTop: i === 0 ? 'none' : `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.03) }
                            }}
                        >
                            <PersonAvatar name={customer.name} size={24} />
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem', flexShrink: 0 }}
                                noWrap
                            >
                                {customer.name}
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
                                {t(reason, reasonVars)}
                            </Typography>
                            <Box
                                sx={{
                                    px: 0.875,
                                    py: 0.125,
                                    borderRadius: 1,
                                    bgcolor: alpha(tone, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                                    color: 'text.primary',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    fontVariantNumeric: 'tabular-nums',
                                    flexShrink: 0
                                }}
                            >
                                {score}
                            </Box>
                        </Stack>
                    )
                })}
            </Stack>
        </MainCard>
    )
}

export default WatchlistTable
