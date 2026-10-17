import PropTypes from 'prop-types'
import { flushSync } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, IconButton, Stack } from '@mui/material'

// icons
import { IconMenu2 } from '@tabler/icons-react'

// project imports
import LogoSection from '../LogoSection'
import TopNav from '../TopNav'
import ProfileSection from './ProfileSection'
import WorkspaceSwitcher from '@/layout/MainLayout/Header/WorkspaceSwitcher'
import OrgWorkspaceBreadcrumbs from '@/layout/MainLayout/Header/OrgWorkspaceBreadcrumbs'

// store
import { store } from '@/store'
import { useConfig } from '@/store/context/ConfigContext'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import { logoutSuccess } from '@/store/reducers/authSlice'
import SessionCurtain from '@/ui-component/session/SessionCurtain'
import DisplayPreferences from '@/ui-component/preferences/DisplayPreferences'
import { markLogoutReturn } from '@/ui-component/mira/miraHandoff'
import { useNavigate } from 'react-router-dom'

// API + hooks
import accountApi from '@/api/account.api'
import useApi from '@/hooks/useApi'
import useNotifier from '@/utils/useNotifier'
import { useLanguage } from '@/store/context/LanguageContext'

// ==============================|| NEXORA HEADER ||============================== //
// Refactored: purple MaterialUISwitch removed → theme-driven icon toggle button.
// Secondary-purple menu-avatar removed → tokenized ghost IconButton.
// Empty `<Box ml/>` spacers removed → Stack gap.

const Header = ({ handleLeftDrawerToggle }) => {
    const theme = useTheme()
    const logoutApi = useApi(accountApi.logout)
    const dispatch = useDispatch()
    const { isEnterpriseLicensed, isCloud } = useConfig()
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const { t } = useLanguage()

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    // Sign-out: show the curtain immediately, log out in the background, then hop to the sign-in
    // screen inside the SPA (no full page reload). A short minimum keeps the transition from flickering.
    const navigate = useNavigate()
    const [signingOut, setSigningOut] = useState(false)
    const signOutStartedAt = useRef(0)
    const signInChunk = useRef(null)
    const [curtainLogo, setCurtainLogo] = useState(null)

    const signOutClicked = () => {
        if (signingOut) return
        signOutStartedAt.current = performance.now()
        // load the sign-in screen now so the hop there never waits on a lazy chunk
        signInChunk.current = import('@/views/auth/signIn').catch(() => null)
        const logoEl = document.querySelector('[data-handoff="logo"]')
        markLogoutReturn({ logoEl, miraEl: document.querySelector('[data-handoff="mira"]') })
        const r = logoEl?.getBoundingClientRect()
        if (r) setCurtainLogo({ rect: { x: r.left, y: r.top, width: r.width, height: r.height }, src: logoEl.currentSrc || logoEl.src })
        setSigningOut(true)
        logoutApi.request()
    }

    useEffect(() => {
        const done = logoutApi.data?.message === 'logged_out'
        if (!signingOut || (!done && !logoutApi.error)) return undefined
        if (logoutApi.error && !done) {
            // server refused: keep the user signed in and say so
            setSigningOut(false)
            enqueueSnackbar({
                message: t('Không đăng xuất được, vui lòng thử lại.'),
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    action: (key) => (
                        <IconButton aria-label={t('Đóng')} onClick={() => closeSnackbar(key)} sx={{ color: 'white' }}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
                        </IconButton>
                    )
                }
            })
            return undefined
        }
        const redirectTo = logoutApi.data?.redirectTo || '/signin'
        const wait = Math.max(0, 300 - (performance.now() - signOutStartedAt.current))
        const timer = setTimeout(async () => {
            await Promise.race([signInChunk.current, new Promise((r) => setTimeout(r, 1200))])
            if (/^https?:\/\//.test(redirectTo)) {
                store.dispatch(logoutSuccess())
                window.location.href = redirectTo
                return
            }
            // leave the guarded shell first, otherwise RequireAuth re-renders on the old route and wins the navigation
            flushSync(() => navigate(redirectTo === '/login' ? '/signin' : redirectTo, { replace: true, state: { loggedOut: true } }))
            store.dispatch(logoutSuccess())
        }, wait)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logoutApi.data, logoutApi.error, signingOut])

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                {isAuthenticated && (
                    <ButtonBase
                        onClick={handleLeftDrawerToggle}
                        aria-label={t('Mở menu')}
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            borderRadius: 1.5,
                            width: 36,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.primary',
                            border: `1px solid ${theme.palette.alpha?.border || alpha('#000', 0.08)}`,
                            transition: theme.transitions?.create?.(['background-color', 'border-color']),
                            '&:hover': {
                                backgroundColor: theme.palette.alpha?.hover || alpha('#000', 0.04),
                                borderColor: theme.palette.alpha?.borderStrong || alpha('#000', 0.15)
                            },
                            '&:focus-visible': {
                                outline: 'none',
                                boxShadow: theme.customShadows?.focusRing
                            }
                        }}
                    >
                        <IconMenu2 stroke={1.75} size={18} />
                    </ButtonBase>
                )}
                <Box component='span' sx={{ display: 'flex', flexShrink: 0 }}>
                    <LogoSection />
                </Box>
                {isAuthenticated && (
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <TopNav />
                    </Box>
                )}
            </Box>

            {/* Grow spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Right cluster: workspace + language + theme + profile */}
            <Stack direction='row' alignItems='center' spacing={1.5}>
                {isEnterpriseLicensed && isAuthenticated && <WorkspaceSwitcher />}
                {isCloud && isAuthenticated && <OrgWorkspaceBreadcrumbs />}
                <DisplayPreferences />
                <ProfileSection handleLogout={signOutClicked} />
                <SessionCurtain open={signingOut} label={t('Đang đăng xuất…')} logoRect={curtainLogo?.rect} logoSrc={curtainLogo?.src} />
            </Stack>
        </>
    )
}

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
}

export default Header
