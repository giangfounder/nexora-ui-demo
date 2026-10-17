import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import MainCard from '@/ui-component/cards/MainCard'
import { useLanguage } from '@/store/context/LanguageContext'

const KPITile = ({ label, value, deltaPct }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const positive = deltaPct >= 0
    const arrowColor = positive ? theme.palette.spectrum.emerald.main : theme.palette.spectrum.rose.main

    return (
        <MainCard border contentSX={{ p: 2 }}>
            <Stack spacing={0.75}>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>{t(label)}</Typography>
                <Stack direction='row' alignItems='baseline' spacing={1}>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                        {value}
                    </Typography>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.25,
                            px: 0.625,
                            py: 0.125,
                            borderRadius: 1,
                            bgcolor: alpha(arrowColor, 0.1),
                            color: arrowColor,
                            fontSize: '0.6875rem',
                            fontWeight: 600
                        }}
                    >
                        <AppIcon name='ArrowUpRight' size={12} style={{ transform: positive ? 'none' : 'rotate(90deg)' }} />
                        {positive ? '+' : ''}
                        {deltaPct}%
                    </Box>
                </Stack>
            </Stack>
        </MainCard>
    )
}

KPITile.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    deltaPct: PropTypes.number.isRequired
}

export default KPITile
