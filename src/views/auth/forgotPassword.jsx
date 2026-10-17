import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// material-ui
import { Alert, Box, Stack, Typography, useTheme } from '@mui/material'

// project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import MainCard from '@/ui-component/cards/MainCard'
import { Input } from '@/ui-component/input/Input'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'

// API
import accountApi from '@/api/account.api'

// Hooks
import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'
import { useError } from '@/store/context/ErrorContext'

// utils
import useNotifier from '@/utils/useNotifier'
import { useLanguage } from '@/store/context/LanguageContext'

// Icons
import { AppIcon } from '@/ui-component/icons/AppIcon'

// ==============================|| ForgotPasswordPage ||============================== //

const ForgotPasswordPage = () => {
    const theme = useTheme()
    const { t } = useLanguage()
    useNotifier()

    const usernameInput = {
        label: t('Username'),
        name: 'username',
        type: 'email',
        placeholder: 'user@company.com'
    }
    const [usernameVal, setUsernameVal] = useState('')
    const { isEnterpriseLicensed } = useConfig()

    const [isLoading, setLoading] = useState(false)
    const [responseMsg, setResponseMsg] = useState(undefined)

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const forgotPasswordApi = useApi(accountApi.forgotPassword)

    const sendResetRequest = async (event) => {
        event.preventDefault()
        setAuthRateLimitError(null)
        const body = {
            user: {
                email: usernameVal
            }
        }
        setLoading(true)
        await forgotPasswordApi.request(body)
    }

    useEffect(() => {
        setAuthRateLimitError(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setAuthRateLimitError])

    useEffect(() => {
        if (forgotPasswordApi.error) {
            const errMessage =
                typeof forgotPasswordApi.error.response.data === 'object'
                    ? forgotPasswordApi.error.response.data.message
                    : forgotPasswordApi.error.response.data
            setResponseMsg({
                type: 'error',
                msg: errMessage ?? t('Failed to send instructions, please contact your administrator.')
            })
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordApi.error])

    useEffect(() => {
        if (forgotPasswordApi.data) {
            setResponseMsg({
                type: 'success',
                msg: t('Password reset instructions sent to the email.')
            })
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forgotPasswordApi.data])

    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ width: '480px', gap: 3 }}>
                    {responseMsg && responseMsg?.type === 'error' && (
                        <Alert icon={<AppIcon name='WarningCircle' />} variant='filled' severity='error'>
                            {responseMsg.msg}
                        </Alert>
                    )}
                    {authRateLimitError && (
                        <Alert icon={<AppIcon name='WarningCircle' />} variant='filled' severity='error'>
                            {authRateLimitError}
                        </Alert>
                    )}
                    {responseMsg && responseMsg?.type !== 'error' && (
                        <Alert icon={<AppIcon name='CheckCircle' />} variant='filled' severity='success'>
                            {responseMsg.msg}
                        </Alert>
                    )}
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant='h1'>{t('Forgot Password?')}</Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            {t('Have a reset password code?')}{' '}
                            <Link style={{ color: theme.palette.primary.main }} to='/reset-password'>
                                {t('Change your password here')}
                            </Link>
                            .
                        </Typography>
                    </Stack>
                    <form onSubmit={sendResetRequest}>
                        <Stack sx={{ width: '100%', flexDirection: 'column', alignItems: 'left', justifyContent: 'center', gap: 2 }}>
                            <Box>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Typography>
                                        {t('Email')}
                                        <span style={{ color: theme.palette.error.main }}>&nbsp;*</span>
                                    </Typography>
                                    <Typography align='left'></Typography>
                                    <div style={{ flexGrow: 1 }}></div>
                                </div>
                                <Input
                                    inputParam={usernameInput}
                                    onChange={(newValue) => setUsernameVal(newValue)}
                                    value={usernameVal}
                                    showDialog={false}
                                />
                                {isEnterpriseLicensed && (
                                    <Typography variant='caption'>
                                        <i>{t('If you forgot the email you used for signing up, please contact your administrator.')}</i>
                                    </Typography>
                                )}
                            </Box>
                            <StyledButton
                                variant='contained'
                                style={{ borderRadius: 12, height: 40, marginRight: 5 }}
                                disabled={!usernameVal}
                                type='submit'
                            >
                                {t('Send Reset Password Instructions')}
                            </StyledButton>
                        </Stack>
                    </form>
                    <BackdropLoader open={isLoading} />
                </Stack>
            </MainCard>
        </>
    )
}

export default ForgotPasswordPage
