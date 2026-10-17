import { useConfig } from '@/store/context/ConfigContext'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { useLocation } from 'react-router-dom'

export const RequireAuth = ({ children }) => {
    const location = useLocation()
    const { loading } = useConfig()
    const currentUser = useSelector((state) => state.auth.user)

    if (loading) return null

    if (!currentUser) {
        const path = location.pathname + location.search
        return <Navigate to='/signin' replace state={location.pathname === '/' ? undefined : { path }} />
    }

    return children
}

RequireAuth.propTypes = {
    permission: PropTypes.string,
    display: PropTypes.string,
    children: PropTypes.element
}

// Legacy props (permission, display) still accepted for backward-compat in dev/preview mode — ignored.
