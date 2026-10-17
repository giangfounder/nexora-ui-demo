import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'
import Tag from './sections/Tag'
import { useChartPalette } from './chartTheme'
import { useLanguage } from '@/store/context/LanguageContext'

const KPIRow = ({ metrics }) => {
    const theme = useTheme()
    const c = useChartPalette()
    const { t } = useLanguage()
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${metrics.length}, 1fr)` }, gap: 1.5 }}>
            {metrics.map((m) => {
                const positive = (m.delta ?? 0) >= 0
                const Arrow = positive ? iconComponent('ArrowUpRight') : iconComponent('ArrowDownRight')
                return (
                    <Box key={m.label} sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>
                        <Stack spacing={1}>
                            <Stack direction='row' alignItems='center' spacing={0.75}>
                                {m.icon && <AppIcon name={m.icon} size={16} color={c.tone(m.tone)} />}
                                <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {m.label}
                                </Typography>
                            </Stack>
                            <Typography variant='h2' component='div' sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                {m.value}
                            </Typography>
                            {typeof m.delta === 'number' && (
                                <Stack direction='row' alignItems='center' spacing={0.75}>
                                    <Tag
                                        tone={positive ? c.positive : c.negative}
                                        icon={<Arrow size={12} stroke={1.75} />}
                                        label={`${positive ? '+' : ''}${m.delta}%`}
                                    />
                                    {m.hint && (
                                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                            {t(m.hint)}
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                )
            })}
        </Box>
    )
}

KPIRow.propTypes = {
    metrics: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.node.isRequired,
            delta: PropTypes.number,
            tone: PropTypes.oneOf(['rose', 'orange', 'amber', 'emerald', 'teal']),
            hint: PropTypes.string
        })
    ).isRequired
}

export default KPIRow
