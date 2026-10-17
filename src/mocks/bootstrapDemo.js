// Prototype mode: không còn tự đăng nhập — khách luôn thấy trang đăng nhập, nhập gì cũng vào được.
// Các bản cũ ép sẵn phiên đăng nhập vào localStorage; xoá một lần để trình duyệt cũ cũng thấy trang đăng nhập.
const AUTH_KEYS = ['isAuthenticated', 'isGlobal', 'isSSO', 'user', 'permissions', 'features']
const FLAG = 'nexoraAuthBootstrapV'

if (typeof window !== 'undefined') {
    try {
        if (localStorage.getItem(FLAG) !== '2') {
            AUTH_KEYS.forEach((k) => localStorage.removeItem(k))
            localStorage.setItem(FLAG, '2')
        }
    } catch (e) {
        // storage unavailable — nothing to clean
    }
}

export const isDemoMode = () => true
