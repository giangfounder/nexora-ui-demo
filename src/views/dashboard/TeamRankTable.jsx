import { alpha, useTheme } from '@mui/material/styles'
import { Stack, Typography } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'
import { mockEmployees } from '@/views/employees/mockEmployees'
import { teamStats } from './mockDashboard'
import { useLanguage } from '@/store/context/LanguageContext'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const TeamRankTable = () => {
    const theme = useTheme()
    const { t } = useLanguage()

    const rows = Object.entries(teamStats)
        .map(([id, s]) => {
            const emp = mockEmployees.find((e) => e.id === id)
            return emp ? { emp, ...s } : null
        })
        .filter(Boolean)
        .sort((a, b) => b.conversations - a.conversations)
        .slice(0, 5)

    return (
        <MainCard border contentSX={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5 }}>{t('Nhân viên hôm nay')}</Typography>
            <Stack>
                {rows.map(({ emp, conversations }, i) => {
                    return (
                        <Stack
                            key={emp.id}
                            direction='row'
                            alignItems='center'
                            spacing={1.25}
                            sx={{
                                height: 40,
                                borderTop: i === 0 ? 'none' : `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                            }}
                        >
                            <PersonAvatar name={emp.name} size={24} />
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem', flexShrink: 0 }}
                                noWrap
                            >
                                {emp.name}
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
                                {t(emp.jobTitle)}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'text.primary',
                                    flexShrink: 0
                                }}
                            >
                                {conversations}
                            </Typography>
                        </Stack>
                    )
                })}
            </Stack>
        </MainCard>
    )
}

export default TeamRankTable
