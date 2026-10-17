import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import { store } from '@/store'

// material-ui
import { Divider, Box, Button, List, ListItemButton, ListItemIcon, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import useNotifier from '@/utils/useNotifier'
import { useConfig } from '@/store/context/ConfigContext'
import { useLanguage } from '@/store/context/LanguageContext'

// API
import { logoutSuccess } from '@/store/reducers/authSlice'

// Hooks
import useApi from '@/hooks/useApi'

// icons
import { AppIcon } from '@/ui-component/icons/AppIcon'
import accountApi from '@/api/account.api'

const CloudMenuList = () => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    useNotifier()
    const theme = useTheme()
    const { t } = useLanguage()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const logoutApi = useApi(accountApi.logout)
    const { isCloud } = useConfig()

    const signOutClicked = () => {
        logoutApi.request()
        enqueueSnackbar({
            message: t('Logging out...'),
            options: {
                key: new Date().getTime() + Math.random(),
                variant: 'success',
                action: (key) => (
                    <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                        <AppIcon name='X' />
                    </Button>
                )
            }
        })
    }

    useEffect(() => {
        try {
            if (logoutApi.data && logoutApi.data.message === 'logged_out') {
                store.dispatch(logoutSuccess())
                window.location.href = logoutApi.data.redirectTo
            }
        } catch (e) {
            console.error(e)
        }
    }, [logoutApi.data])

    return (
        <>
            {isCloud && (
                <Box>
                    <Divider sx={{ height: '1px', borderColor: theme.palette.alpha?.divider || theme.palette.divider, my: 0 }} />
                    <List sx={{ p: '16px', py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <a href='https://docs.flowiseai.com' target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
                            <ListItemButton
                                sx={{
                                    borderRadius: `${customization.borderRadius}px`,
                                    alignItems: 'flex-start',
                                    backgroundColor: 'inherit',
                                    py: 1.25,
                                    pl: '24px'
                                }}
                            >
                                <ListItemIcon sx={{ my: 'auto', minWidth: 36 }}>
                                    <AppIcon name='FileText' size='1.3rem' />
                                </ListItemIcon>
                                <Typography variant='body1' color='inherit' sx={{ my: 0.5 }}>
                                    {t('Documentation')}
                                </Typography>
                            </ListItemButton>
                        </a>
                        <ListItemButton
                            onClick={signOutClicked}
                            sx={{
                                borderRadius: `${customization.borderRadius}px`,
                                alignItems: 'flex-start',
                                backgroundColor: 'inherit',
                                py: 1.25,
                                pl: '24px'
                            }}
                        >
                            <ListItemIcon sx={{ my: 'auto', minWidth: 36 }}>
                                <AppIcon name='SignOut' size='1.3rem' />
                            </ListItemIcon>
                            <Typography variant='body1' color='inherit' sx={{ my: 0.5 }}>
                                {t('Logout')}
                            </Typography>
                        </ListItemButton>
                    </List>
                </Box>
            )}
        </>
    )
}

export default CloudMenuList
