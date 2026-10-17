import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase, Typography, Stack } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'

// icons
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { Available } from '@/ui-component/rbac/available'
import { useLanguage } from '@/store/context/LanguageContext'

const headerButtonSx = (theme, tone) => {
    const main = tone ? theme.palette[tone].main : theme.palette.text.secondary
    return {
        background: tone ? alpha(main, 0.1) : 'transparent',
        color: main,
        border: `1px solid ${tone ? alpha(main, 0.25) : theme.palette.alpha.border}`,
        borderRadius: '6px',
        '&:hover': {
            background: tone ? alpha(main, 0.16) : theme.palette.alpha.hover,
            color: tone ? main : theme.palette.text.primary
        }
    }
}

// ==============================|| CANVAS HEADER ||============================== //

const MarketplaceCanvasHeader = ({ flowName, flowData, onChatflowCopy }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const navigate = useNavigate()

    return (
        <>
            <Box>
                <ButtonBase title={t('Back')} sx={{ borderRadius: '6px' }}>
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all 150ms ease-out',
                            ...headerButtonSx(theme)
                        }}
                        color='inherit'
                        onClick={() => navigate(-1)}
                    >
                        <AppIcon name='CaretLeft' size={18} />
                    </Avatar>
                </ButtonBase>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Stack flexDirection='row'>
                    <Typography
                        variant='h3'
                        sx={{
                            ml: 2
                        }}
                    >
                        {flowName}
                    </Typography>
                </Stack>
            </Box>
            <Available permission={'chatflows:create,agentflows.create'}>
                <Box>
                    <StyledButton
                        color='secondary'
                        variant='contained'
                        title={t('Use Chatflow')}
                        onClick={() => onChatflowCopy(flowData)}
                        startIcon={<AppIcon name='Copy' />}
                    >
                        {t('Use Template')}
                    </StyledButton>
                </Box>
            </Available>
        </>
    )
}

MarketplaceCanvasHeader.propTypes = {
    flowName: PropTypes.string,
    flowData: PropTypes.object,
    onChatflowCopy: PropTypes.func
}

export default MarketplaceCanvasHeader
