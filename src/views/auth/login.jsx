import { Navigate, useLocation } from 'react-router-dom'

// Prototype: không có máy chủ xác thực — chuyển thẳng sang trang đăng nhập, giữ lại trang định mở.
const ResolveLoginPage = () => {
    const location = useLocation()
    return <Navigate to='/signin' replace state={location.state} />
}

export default ResolveLoginPage
