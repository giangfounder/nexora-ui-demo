import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { alpha, useTheme } from '@mui/material/styles'
import { Stack, Typography, Box, Alert, Button, Divider, TextField, IconButton, InputAdornment } from '@mui/material'
import { IconExclamationCircle, IconEye, IconEyeOff } from '@tabler/icons-react'
import { LoadingButton } from '@mui/lab'

import useApi from '@/hooks/useApi'
import { useConfig } from '@/store/context/ConfigContext'
import { useError } from '@/store/context/ErrorContext'

import authApi from '@/api/auth'
import accountApi from '@/api/account.api'
import loginMethodApi from '@/api/loginmethod'
import ssoApi from '@/api/sso'

import useNotifier from '@/utils/useNotifier'

import { loginSuccess, logoutSuccess } from '@/store/reducers/authSlice'
import { store } from '@/store'

import AzureSSOLoginIcon from '@/assets/images/microsoft-azure.svg'
import GoogleSSOLoginIcon from '@/assets/images/google.svg'
import Auth0SSOLoginIcon from '@/assets/images/auth0.svg'
import GithubSSOLoginIcon from '@/assets/images/github.svg'
import LoginLockup from './LoginLockup'
import { clearLogoutReturn, markMiraArrival, readLogoutReturn } from '@/ui-component/mira/miraHandoff'
import MiraMascot from '@/ui-component/mira/MiraMascot'
import { LEGAL_DOCS, LEGAL_ENTITY } from '@/views/legal/legalContent'
import { useLanguage } from '@/store/context/LanguageContext'
import { LanguageInline } from '@/ui-component/preferences/DisplayPreferences'

const SSO_LABELS = {
    azure: { label: 'Đăng nhập bằng Microsoft', icon: AzureSSOLoginIcon, alt: 'Microsoft' },
    google: { label: 'Đăng nhập bằng Google', icon: GoogleSSOLoginIcon, alt: 'Google' },
    auth0: { label: 'Đăng nhập bằng Auth0', icon: Auth0SSOLoginIcon, alt: 'Auth0' },
    github: { label: 'Đăng nhập bằng GitHub', icon: GithubSSOLoginIcon, alt: 'GitHub' }
}

// The lockup scales with width AND height so lockup + form (~260px) + footer always fit one screen;
// on very short screens it stops shrinking and the page scrolls. The SVG box is ≈3.17:1 and the form
// tucks 2% into its empty bottom margin, so each unit of width costs ≈0.3 units of height.
const LOGO_WIDTH = 'min(1040px, 92vw, max(300px, calc((100vh - 420px) * 3.3)))'

// Logo flight and Mira's hop share one timeline so they meet in the same beat.
const RETURN_MS = 900
// Both land at the same instant: this fraction of RETURN_MS is the flight, the rest is the shared settle.
const MEET_AT = 0.8

// Sign-out, reverse trip: a stand-in Mira starts where she was docked and hops back into the "O".
// The landing spot is resolved once web fonts are ready (the "O" slot depends on text metrics) and from
// layout offsets, so the logo's own flight transform can't skew it.
const MiraReturn = ({ from, lockupRect, botEl, startedAt, onDone }) => {
    const ref = useRef(null)
    const [to, setTo] = useState(null)

    // Resolve the landing spot before the first paint when fonts are already loaded (the usual case
    // after a session), so Mira takes off in the same frame as the logo — no empty "O", no late start.
    useLayoutEffect(() => {
        let alive = true
        const resolve = () => {
            if (!alive || !botEl) return
            setTo({ x: lockupRect.left + botEl.offsetLeft, y: lockupRect.top + botEl.offsetTop, size: botEl.offsetWidth })
        }
        if (!document.fonts || document.fonts.status === 'loaded') resolve()
        else document.fonts.ready.then(() => setTimeout(resolve, 0))
        return () => {
            alive = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useLayoutEffect(() => {
        const el = ref.current
        if (!to) return undefined
        if (!el || !el.animate) {
            onDone()
            return undefined
        }
        const dx = from.x + from.width / 2 - (to.x + to.size / 2)
        const dy = from.y + from.height / 2 - (to.y + to.size / 2)
        const s0 = from.width / to.size
        const height = Math.max(120, Math.hypot(dx, dy) * 0.25)
        const lean = dx > 0 ? -1 : 1
        const frames = []
        const STEPS = 16
        for (let i = 0; i <= STEPS; i++) {
            const t = i / STEPS
            const sc = s0 + (1 - s0) * t
            const stretch = 1 + 0.08 * Math.sin(Math.PI * t)
            frames.push({
                offset: MEET_AT * t,
                transform: `translate(${dx * (1 - t)}px, ${dy * (1 - t) - 4 * height * t * (1 - t)}px) rotate(${
                    lean * 12 * Math.sin(Math.PI * t)
                }deg) scale(${sc / stretch}, ${sc * stretch})`
            })
        }
        frames.push(
            { offset: MEET_AT + (1 - MEET_AT) * 0.35, transform: 'translate(0px, 4px) rotate(0deg) scale(1.12, 0.88)' },
            { offset: MEET_AT + (1 - MEET_AT) * 0.7, transform: 'translate(0px, -5px) rotate(0deg) scale(0.98, 1.03)' },
            { offset: 1, transform: 'translate(0px, 0px) rotate(0deg) scale(1, 1)' }
        )
        const anim = el.animate(frames, { duration: RETURN_MS, easing: 'linear', fill: 'backwards' })
        // share the logo's clock: if Mira mounts a few frames late she joins at the same phase
        anim.currentTime = Math.min(RETURN_MS, Math.max(0, performance.now() - startedAt))
        // onfinish can be delayed while the tab is in the background; the timer guarantees the swap back
        let finished = false
        const finish = () => {
            if (finished) return
            finished = true
            onDone()
        }
        anim.onfinish = finish
        const fallback = setTimeout(finish, RETURN_MS + 150)
        return () => {
            clearTimeout(fallback)
            anim.cancel()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [to])

    if (!to) return null
    return (
        <Box
            ref={ref}
            aria-hidden
            sx={{ position: 'fixed', left: to.x, top: to.y, width: to.size, height: to.size, zIndex: 20, pointerEvents: 'none' }}
        >
            <MiraMascot size={to.size} />
        </Box>
    )
}

MiraReturn.propTypes = {
    from: PropTypes.object.isRequired,
    lockupRect: PropTypes.object.isRequired,
    botEl: PropTypes.object,
    startedAt: PropTypes.number,
    onDone: PropTypes.func
}

const SignInPage = () => {
    const theme = useTheme()
    const { t } = useLanguage()
    useSelector((state) => state.customization)
    useNotifier()
    const { isEnterpriseLicensed, isOpenSource } = useConfig()

    const [usernameVal, setUsernameVal] = useState('')
    const [passwordVal, setPasswordVal] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [capsLock, setCapsLock] = useState(false)
    const [configuredSsoProviders, setConfiguredSsoProviders] = useState([])
    const [authError, setAuthError] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [showResendButton, setShowResendButton] = useState(false)
    // Known before the first paint so the layout (and the sign-out return flight) doesn't shift afterwards.
    const [successMessage, setSuccessMessage] = useState(() => (window.history.state?.usr?.loggedOut ? 'Bạn đã đăng xuất.' : ''))

    // Warm the app shell and first screen while the user types, so signing in lands instantly.
    useEffect(() => {
        const warm = () => {
            import('@/layout/MainLayout')
            import('@/views/dashboard')
        }
        const id = window.requestIdleCallback ? window.requestIdleCallback(warm) : setTimeout(warm, 600)
        return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id))
    }, [])

    const { authRateLimitError, setAuthRateLimitError } = useError()

    const loginApi = useApi(authApi.login)
    const ssoLoginApi = useApi(ssoApi.ssoLogin)
    const getDefaultProvidersApi = useApi(loginMethodApi.getDefaultLoginMethods)
    const navigate = useNavigate()
    const logoRef = useRef(null)
    const botRef = useRef(null)
    const location = useLocation()

    // Coming back from sign-out: logo flies home from the header, Mira hops back into the "O".
    const [returnFrom] = useState(() => (location.state?.loggedOut ? readLogoutReturn() : null))
    const [miraTrip, setMiraTrip] = useState(null)
    useLayoutEffect(() => {
        clearLogoutReturn()
        const lockup = logoRef.current
        const bot = botRef.current
        if (!returnFrom || !lockup || !bot || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
        // measure before anything moves
        const to = lockup.getBoundingClientRect()
        let anim = null
        const startedAt = performance.now()
        if (returnFrom.logo && lockup.animate) {
            const f = returnFrom.logo
            const dx = f.x + f.width / 2 - (to.left + to.width / 2)
            const dy = f.y + f.height / 2 - (to.top + to.height / 2)
            const sc = f.width / to.width
            anim = lockup.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
                    { offset: MEET_AT, transform: 'translate(0px, 0px) scale(1.012)', easing: 'ease-out' },
                    { transform: 'translate(0px, 0px) scale(1)' }
                ],
                { duration: RETURN_MS, easing: 'linear', fill: 'backwards' }
            )
        }
        if (returnFrom.mira) {
            bot.style.opacity = '0'
            setMiraTrip({ from: returnFrom.mira, lockupRect: { left: to.left, top: to.top }, startedAt })
        }
        return () => {
            anim?.cancel()
            bot.style.opacity = ''
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnFrom])

    // Arriving from sign-out: confirm it quietly, then drop the flag so a refresh doesn't repeat it.
    useEffect(() => {
        if (location.state?.loggedOut) {
            navigate(location.pathname + location.search, { replace: true, state: {} })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const resendVerificationApi = useApi(accountApi.resendVerificationEmail)

    const doLogin = (event) => {
        event.preventDefault()
        setAuthRateLimitError(null)
        setLoading(true)
        loginApi.request({ email: usernameVal, password: passwordVal })
    }

    useEffect(() => {
        if (loginApi.error) {
            setLoading(false)
            if (loginApi.error.response.status === 401 && loginApi.error.response.data.redirectUrl) {
                window.location.href = loginApi.error.response.data.data.redirectUrl
            } else {
                setAuthError(loginApi.error.response.data.message)
            }
        }
    }, [loginApi.error])

    useEffect(() => {
        store.dispatch(logoutSuccess())
        setAuthRateLimitError(null)
        if (!isOpenSource) {
            getDefaultProvidersApi.request()
        }
    }, [setAuthRateLimitError, isOpenSource])

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const errorData = queryParams.get('error')
        if (!errorData) return
        const parsedErrorData = JSON.parse(decodeURIComponent(errorData))
        setAuthError(parsedErrorData.message)
    }, [location.search])

    useEffect(() => {
        if (loginApi.data) {
            setLoading(false)
            store.dispatch(loginSuccess(loginApi.data))
            markMiraArrival({ botEl: botRef.current, logoEl: logoRef.current })
            navigate(location.state?.path || '/dashboard', { replace: true })
        }
    }, [loginApi.data])

    useEffect(() => {
        if (ssoLoginApi.data) {
            store.dispatch(loginSuccess(ssoLoginApi.data))
            markMiraArrival({ botEl: botRef.current, logoEl: logoRef.current })
            navigate(location.state?.path || '/dashboard', { replace: true })
        }
    }, [ssoLoginApi.data])

    useEffect(() => {
        if (ssoLoginApi.error) {
            if (ssoLoginApi.error?.response?.status === 401 && ssoLoginApi.error?.response?.data.redirectUrl) {
                window.location.href = ssoLoginApi.error.response.data.redirectUrl
            } else {
                setAuthError(ssoLoginApi.error.message)
            }
        }
    }, [ssoLoginApi.error])

    useEffect(() => {
        if (getDefaultProvidersApi.data && getDefaultProvidersApi.data.providers) {
            setConfiguredSsoProviders(getDefaultProvidersApi.data.providers.map((provider) => provider))
        }
    }, [getDefaultProvidersApi.data])

    useEffect(() => {
        setShowResendButton(authError === 'User Email Unverified')
    }, [authError])

    const signInWithSSO = (ssoProvider) => {
        window.location.href = `/api/v1/${ssoProvider}/login`
    }

    const handleResendVerification = async () => {
        try {
            await resendVerificationApi.request({ email: usernameVal })
            setAuthError(undefined)
            setSuccessMessage('Đã gửi lại email xác thực.')
            setShowResendButton(false)
        } catch (error) {
            setAuthError(error.response?.data?.message || t('Không thể gửi lại email xác thực.'))
        }
    }

    const accent = theme.palette.primary.main
    const isDark = theme.palette.mode === 'dark'
    const hairline = alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08)
    // Solid field colours (not alpha) so browser autofill can be painted to match exactly
    const field = {
        bg: isDark ? '#141C2B' : '#F4F6FA',
        hoverBg: isDark ? '#18223380' : '#EEF1F6',
        focusBg: isDark ? '#15203A' : '#F5F8FF',
        border: isDark ? alpha('#fff', 0.08) : '#E7EBF1'
    }
    const quietLink = {
        color: 'text.secondary',
        textDecoration: 'none',
        transition: 'color 120ms',
        '&:hover, &:focus-visible': { color: 'text.primary' }
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100vw',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                bgcolor: isDark ? 'background.default' : '#fff',
                px: 2.5,
                pt: { xs: 3, sm: 'clamp(16px, 4vh, 48px)' },
                pb: 2
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    my: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {miraTrip && (
                    <MiraReturn
                        from={miraTrip.from}
                        lockupRect={miraTrip.lockupRect}
                        botEl={botRef.current}
                        startedAt={miraTrip.startedAt}
                        onDone={() => {
                            if (botRef.current) botRef.current.style.opacity = ''
                            setMiraTrip(null)
                        }}
                    />
                )}
                <LoginLockup
                    ref={logoRef}
                    botRef={botRef}
                    dark={isDark}
                    sx={{
                        width: LOGO_WIDTH,
                        zIndex: 0,
                        userSelect: 'none',
                        '@keyframes signinMark': {
                            from: { opacity: 0, transform: 'translateY(12px) scale(0.96)' },
                            to: { opacity: 1, transform: 'none' }
                        },
                        animation: returnFrom ? 'none' : 'signinMark 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
                    }}
                />

                <Box
                    component='main'
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 380,
                        // the lockup's SVG box already carries empty space under the glyphs
                        mt: `calc(${LOGO_WIDTH} * -0.02)`,
                        // Filled fields with the label inside: one quiet surface per field, no outline boxes
                        '& .MuiFilledInput-root': {
                            borderRadius: '12px',
                            bgcolor: field.bg,
                            border: `1px solid ${field.border}`,
                            transition: 'background-color 140ms, border-color 140ms',
                            '&:hover': { bgcolor: field.hoverBg },
                            '&.Mui-focused': { bgcolor: field.focusBg, borderColor: accent },
                            '&.Mui-error': { borderColor: theme.palette.error.main }
                        },
                        '& .MuiFilledInput-input': { pt: '26px', pb: '10px', px: '16px', fontSize: 15.5, borderRadius: '12px' },
                        '& .MuiInputLabel-filled': {
                            color: 'text.secondary',
                            fontSize: 15,
                            fontWeight: 500,
                            lineHeight: 1.4,
                            transform: 'translate(17px, 19px) scale(1)',
                            '&.MuiInputLabel-shrink': { transform: 'translate(17px, 9px) scale(0.8)' },
                            '&.Mui-focused': { color: accent }
                        },
                        '& .MuiInputAdornment-root': { mr: 0.5 },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                            WebkitBoxShadow: `0 0 0 100px ${field.bg} inset`,
                            WebkitTextFillColor: theme.palette.text.primary,
                            caretColor: theme.palette.text.primary
                        },
                        '@keyframes signinIn': {
                            from: { opacity: 0, transform: 'translateY(8px)' },
                            to: { opacity: 1, transform: 'none' }
                        },
                        animation: 'signinIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
                        animationDelay: returnFrom ? '360ms' : '120ms',
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
                    }}
                >
                    <Typography
                        component='h1'
                        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
                    >
                        {t('Đăng nhập NEXORA')}
                    </Typography>

                    {(successMessage || authRateLimitError || authError) && (
                        <Stack spacing={1.5} sx={{ mb: 2 }} aria-live='polite'>
                            {successMessage && (
                                <Alert variant='outlined' severity='success' onClose={() => setSuccessMessage('')}>
                                    {t(successMessage)}
                                </Alert>
                            )}
                            {authRateLimitError && (
                                <Alert icon={<IconExclamationCircle size={18} stroke={1.75} />} variant='outlined' severity='error'>
                                    {authRateLimitError}
                                </Alert>
                            )}
                            {authError && (
                                <Alert icon={<IconExclamationCircle size={18} stroke={1.75} />} variant='outlined' severity='error'>
                                    {authError}
                                    {showResendButton && (
                                        <Button
                                            variant='text'
                                            size='small'
                                            onClick={handleResendVerification}
                                            sx={{ display: 'block', px: 0, mt: 0.5 }}
                                        >
                                            {t('Gửi lại email xác thực')}
                                        </Button>
                                    )}
                                </Alert>
                            )}
                        </Stack>
                    )}

                    <form noValidate onSubmit={doLogin}>
                        <Stack spacing={1.5}>
                            <TextField
                                id='signin-email'
                                name='email'
                                label={t('Email')}
                                variant='filled'
                                fullWidth
                                type='email'
                                required
                                value={usernameVal}
                                onChange={(e) => setUsernameVal(e.target.value)}
                                autoComplete='username'
                                inputProps={{ spellCheck: false }}
                                InputProps={{ disableUnderline: true }}
                                InputLabelProps={{ required: false }}
                            />
                            <Box>
                                <TextField
                                    id='signin-password'
                                    name='password'
                                    label={t('Mật khẩu')}
                                    variant='filled'
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={passwordVal}
                                    onChange={(e) => setPasswordVal(e.target.value)}
                                    onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
                                    onKeyDown={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
                                    onBlur={() => setCapsLock(false)}
                                    autoComplete='current-password'
                                    inputProps={{ 'aria-describedby': capsLock ? 'signin-capslock' : undefined }}
                                    InputLabelProps={{ required: false }}
                                    InputProps={{
                                        disableUnderline: true,
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    size='small'
                                                    edge='end'
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    aria-label={showPassword ? t('Ẩn mật khẩu') : t('Hiện mật khẩu')}
                                                    aria-pressed={showPassword}
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    {showPassword ? (
                                                        <IconEyeOff size={19} stroke={1.6} />
                                                    ) : (
                                                        <IconEye size={19} stroke={1.6} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 1, minHeight: 20 }}>
                                    <Typography
                                        id='signin-capslock'
                                        role='status'
                                        sx={{
                                            fontSize: 12.5,
                                            color: 'warning.dark',
                                            visibility: capsLock ? 'visible' : 'hidden'
                                        }}
                                    >
                                        {t('Caps Lock đang bật')}
                                    </Typography>
                                    <Box component={Link} to='/forgot-password' sx={{ ...quietLink, fontSize: 13 }}>
                                        {t('Quên mật khẩu?')}
                                    </Box>
                                </Stack>
                            </Box>

                            <LoadingButton
                                loading={loading}
                                variant='contained'
                                type='submit'
                                fullWidth
                                disableElevation
                                sx={{
                                    mt: '8px !important',
                                    height: 52,
                                    borderRadius: '12px',
                                    fontSize: 15.5,
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none', bgcolor: theme.palette.primary.dark }
                                }}
                            >
                                {t('Đăng nhập')}
                            </LoadingButton>

                            {configuredSsoProviders?.length > 0 && (
                                <>
                                    <Divider
                                        sx={{
                                            typography: 'caption',
                                            color: 'text.disabled',
                                            '&::before, &::after': { borderColor: hairline }
                                        }}
                                    >
                                        {t('hoặc')}
                                    </Divider>
                                    {configuredSsoProviders.map((ssoProvider) => {
                                        const meta = SSO_LABELS[ssoProvider]
                                        if (!meta) return null
                                        return (
                                            <Button
                                                key={ssoProvider}
                                                variant='outlined'
                                                fullWidth
                                                onClick={() => signInWithSSO(ssoProvider)}
                                                sx={{
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    color: 'text.primary',
                                                    fontWeight: 500,
                                                    borderColor: field.border
                                                }}
                                                startIcon={<Box component='img' src={meta.icon} alt='' width={18} height={18} />}
                                            >
                                                {t(meta.label)}
                                            </Button>
                                        )
                                    })}
                                </>
                            )}

                            {isEnterpriseLicensed && (
                                <Box component={Link} to='/register' sx={{ ...quietLink, fontSize: 13.5, textAlign: 'center', pt: 0.5 }}>
                                    {t('Có mã mời?')}{' '}
                                    <Box component='span' sx={{ color: accent, fontWeight: 600 }}>
                                        {t('Tạo tài khoản')}
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </form>
                </Box>
            </Box>

            <Box
                component='footer'
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 1040,
                    mt: 'clamp(16px, 3vh, 40px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    fontSize: 13,
                    color: 'text.disabled',
                    '@keyframes signinFooter': { from: { opacity: 0 }, to: { opacity: 1 } },
                    animation: 'signinFooter 600ms 200ms ease-out both',
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
                }}
            >
                <span>
                    © {new Date().getFullYear()} {LEGAL_ENTITY.brand}
                </span>
                <Box
                    component='nav'
                    aria-label={t('Pháp lý')}
                    sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', columnGap: 2.5 }}
                >
                    <Box component={Link} to={LEGAL_DOCS.terms.path} target='_blank' rel='noopener' sx={quietLink}>
                        {t('Điều khoản')}
                    </Box>
                    <Box component={Link} to={LEGAL_DOCS.privacy.path} target='_blank' rel='noopener' sx={quietLink}>
                        {t('Bảo mật')}
                    </Box>
                    <Box component='a' href={`mailto:${LEGAL_ENTITY.supportEmail}`} sx={quietLink}>
                        {t('Hỗ trợ')}
                    </Box>
                    <LanguageInline sx={{ ml: -0.75 }} />
                </Box>
            </Box>
        </Box>
    )
}

export default SignInPage
