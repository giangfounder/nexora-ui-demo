import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'

// material-ui
import { alpha, styled, useTheme } from '@mui/material/styles'
import { AppBar, Box, CssBaseline, Toolbar } from '@mui/material'

// project imports
import Header from './Header'
import Sidebar from './Sidebar'
import AnnouncementBanner from './AnnouncementBanner'
import MiraAssistant from '@/ui-component/mira/MiraAssistant'
import { assistantClearance, headerHeight, pageBottom, pageGutter, pageTop } from '@/store/constant'
import { SET_MENU } from '@/store/actions'
import { useLanguage } from '@/store/context/LanguageContext'

const BANNER_HEIGHT = 45
const BANNER_DISMISSED_KEY = 'gtech.announcementDismissed'

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'bannerOffset' })(({ theme, bannerOffset }) => ({
    ...theme.typography.mainContent,
    backgroundColor: theme.palette.background.default,
    width: '100%',
    minHeight: `calc(100vh - ${headerHeight + bannerOffset}px)`,
    marginTop: `${headerHeight + bannerOffset}px`,
    paddingTop: pageTop,
    paddingBottom: pageBottom + assistantClearance,
    paddingLeft: pageGutter.xs,
    paddingRight: pageGutter.xs,
    [theme.breakpoints.up('sm')]: { paddingLeft: pageGutter.sm, paddingRight: pageGutter.sm }
}))

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const theme = useTheme()
    const { t } = useLanguage()

    const location = useLocation()

    // Handle left drawer
    const leftDrawerOpened = useSelector((state) => state.customization.opened)
    const dispatch = useDispatch()
    const handleLeftDrawerToggle = () => {
        dispatch({ type: SET_MENU, opened: !leftDrawerOpened })
    }

    useEffect(() => {
        dispatch({ type: SET_MENU, opened: false })
    }, [location.pathname, dispatch])

    // AnnouncementBanner returns null unless `announcement.banner` i18n key is set,
    // so bannerOffset defaults to 0. Enable by adding the key + dropping the default-dismissed check.
    const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem(BANNER_DISMISSED_KEY) !== 'false')
    const handleDismissBanner = () => {
        localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
        setBannerDismissed(true)
    }
    const bannerOffset = bannerDismissed ? 0 : BANNER_HEIGHT

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* Skip link — keyboard users tab it first to jump past nav */}
            <Box
                component='a'
                href='#main-content'
                sx={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    zIndex: theme.zIndex.tooltip + 10,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transform: 'translateY(-200%)',
                    transition: 'transform 150ms ease-out',
                    '&:focus': {
                        transform: 'translateY(0)',
                        outline: 'none',
                        boxShadow: theme.customShadows?.focusRing
                    }
                }}
            >
                {t('Bỏ qua điều hướng, chuyển tới nội dung chính')}
            </Box>
            <AppBar
                enableColorOnDark
                position='fixed'
                color='inherit'
                elevation={0}
                sx={{
                    bgcolor: 'background.paper'
                }}
            >
                {!bannerDismissed && <AnnouncementBanner onClose={handleDismissBanner} />}
                <Toolbar
                    sx={{
                        height: `${headerHeight}px`,
                        minHeight: `${headerHeight}px !important`,
                        // same gutter as the page so the logo mark lines up with the content edge
                        px: `${pageGutter.xs}px !important`,
                        [theme.breakpoints.up('sm')]: { px: `${pageGutter.sm}px !important` },
                        borderBottom: '1px solid',
                        borderColor: alpha(theme.palette.text.primary, 0.06)
                    }}
                >
                    <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
                </Toolbar>
            </AppBar>

            {/* drawer */}
            <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

            {/* main content */}
            <Main bannerOffset={bannerOffset} id='main-content' role='main' tabIndex={-1}>
                <Box
                    key={location.pathname}
                    sx={{
                        '@keyframes pageEnter': {
                            from: { opacity: 0 },
                            to: { opacity: 1 }
                        },
                        animation: 'pageEnter 120ms ease-out both',
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
                    }}
                >
                    <Outlet />
                </Box>
            </Main>

            <MiraAssistant />
        </Box>
    )
}

export default MainLayout
