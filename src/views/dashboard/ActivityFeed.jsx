import { useTheme } from '@mui/material/styles'
import { Stack, Typography } from '@mui/material'
import { iconComponent } from '@/ui-component/icons/AppIcon'
import MainCard from '@/ui-component/cards/MainCard'
import { feedEvents, feedAgo, feedText } from './mockDashboard'
import { useLanguage } from '@/store/context/LanguageContext'

const KIND_ICON = {
    customer_new: iconComponent('User'),
    escalate: iconComponent('Warning'),
    pulse_handoff: iconComponent('Lightning'),
    deal_closed: iconComponent('CheckCircle'),
    review: iconComponent('Star')
}

const ActivityFeed = () => {
    const theme = useTheme()
    const { t, locale } = useLanguage()

    return (
        <MainCard border contentSX={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5 }}>{t('Hoạt động')}</Typography>
            <Stack>
                {feedEvents.map((ev, i) => {
                    const Icon = KIND_ICON[ev.kind]
                    const tone = theme.palette.spectrum[ev.tone].main
                    return (
                        <Stack
                            key={ev.id}
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            sx={{
                                py: 1,
                                borderTop: i === 0 ? 'none' : `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Icon size={12} color={tone} style={{ flexShrink: 0 }} />
                            <Typography variant='body2' sx={{ flex: 1, minWidth: 0, color: 'text.primary', fontSize: '0.8125rem' }} noWrap>
                                {feedText(t, ev, locale)}
                            </Typography>
                            <Typography
                                sx={{ color: 'text.disabled', fontSize: '0.6875rem', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                            >
                                {feedAgo(t, ev)}
                            </Typography>
                        </Stack>
                    )
                })}
            </Stack>
        </MainCard>
    )
}

export default ActivityFeed
