import { Outlet, useLocation } from 'react-router-dom'
import { Box, useTheme } from '@mui/material'

// ==============================|| AUTH LAYOUT ||============================== //

const FULL_BLEED_PATHS = ['/login', '/signin', '/terms', '/privacy', '/cookies']

const AuthLayout = () => {
    const theme = useTheme()
    const { pathname } = useLocation()

    if (FULL_BLEED_PATHS.includes(pathname)) {
        return <Outlet />
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                [theme.breakpoints.down(1367)]: {
                    alignItems: 'start',
                    overflowY: 'auto',
                    py: '64px'
                }
            }}
        >
            <Outlet />
        </Box>
    )
}

export default AuthLayout
