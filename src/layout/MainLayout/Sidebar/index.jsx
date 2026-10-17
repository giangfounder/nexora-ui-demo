import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Drawer } from '@mui/material'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'
import { BrowserView, MobileView } from 'react-device-detect'

// project imports
import MenuList from './MenuList'
import LogoSection from '../LogoSection'
import CloudMenuList from '@/layout/MainLayout/Sidebar/CloudMenuList'

// store
import { drawerWidth, headerHeight } from '@/store/constant'

// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
    const theme = useTheme()
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    const drawer = (
        <>
            <Box
                sx={{
                    height: headerHeight,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                }}
            >
                <LogoSection />
            </Box>
            <BrowserView>
                <PerfectScrollbar
                    component='div'
                    style={{
                        height: `calc(100vh - ${headerHeight}px)`,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <MenuList />
                    <CloudMenuList />
                </PerfectScrollbar>
            </BrowserView>
            <MobileView>
                <Box sx={{ px: 2 }}>
                    <MenuList />
                    <CloudMenuList />
                </Box>
            </MobileView>
        </>
    )

    const container = window !== undefined ? () => window.document.body : undefined

    return (
        <Box
            component='nav'
            sx={{
                width: 'auto'
            }}
            aria-label='Điều hướng chính'
        >
            {isAuthenticated && (
                <Drawer
                    container={container}
                    variant='temporary'
                    anchor='left'
                    open={drawerOpen}
                    onClose={drawerToggle}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            background: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                        }
                    }}
                    ModalProps={{ keepMounted: false }}
                    color='inherit'
                >
                    {drawer}
                </Drawer>
            )}
        </Box>
    )
}

Sidebar.propTypes = {
    drawerOpen: PropTypes.bool,
    drawerToggle: PropTypes.func,
    window: PropTypes.object
}

export default Sidebar
