// Hand-off between the login screen and the main screen:
// the login lockup flies up to the header logo, the mascot inside its "O" jumps down to Mira's dock.

export const ARRIVAL_KEY = 'gtech.miraArrival'
export const CHIBI_POS_KEY = 'gtech.chibiPos'
export const LOGO_POS_KEY = 'gtech.logoPos'
export const DOCK_POS_KEY = 'gtech.miraDock'
export const RETURN_KEY = 'gtech.logoutReturn'

const safe = (fn, fallback = null) => {
    try {
        return fn()
    } catch {
        return fallback
    }
}

const rectOf = (el) => {
    const r = el?.getBoundingClientRect?.()
    return r && r.width > 0 ? { x: r.left, y: r.top, width: r.width, height: r.height } : null
}

// Called right before navigating away after a successful login.
export const markMiraArrival = ({ botEl, logoEl } = {}) => {
    safe(() => {
        sessionStorage.setItem(ARRIVAL_KEY, '1')
        const bot = rectOf(botEl)
        if (bot) sessionStorage.setItem(CHIBI_POS_KEY, JSON.stringify({ x: bot.x, y: bot.y, size: bot.width, facing: 1 }))
        const logo = rectOf(logoEl)
        if (logo) sessionStorage.setItem(LOGO_POS_KEY, JSON.stringify(logo))
    })
}

const arrivalPending = () => safe(() => sessionStorage.getItem(ARRIVAL_KEY)) === '1'

export const readMiraArrival = () => {
    if (!arrivalPending()) return null
    return { start: safe(() => JSON.parse(sessionStorage.getItem(CHIBI_POS_KEY) || 'null')) }
}

export const clearMiraArrival = () => {
    safe(() => {
        sessionStorage.removeItem(ARRIVAL_KEY)
        sessionStorage.removeItem(CHIBI_POS_KEY)
    })
}

export const readLogoArrival = () => {
    if (!arrivalPending()) return null
    return safe(() => JSON.parse(sessionStorage.getItem(LOGO_POS_KEY) || 'null'))
}

export const clearLogoArrival = () => safe(() => sessionStorage.removeItem(LOGO_POS_KEY))

// Sign-out, the reverse trip: remember where the header logo and docked Mira are, so the sign-in
// screen can fly the logo back to the centre and let Mira hop back into the "O".
export const markLogoutReturn = ({ logoEl, miraEl } = {}) => {
    const logo = rectOf(logoEl)
    const mira = rectOf(miraEl)
    if (logo || mira) safe(() => sessionStorage.setItem(RETURN_KEY, JSON.stringify({ logo, mira })))
}

export const readLogoutReturn = () => safe(() => JSON.parse(sessionStorage.getItem(RETURN_KEY) || 'null'))

export const clearLogoutReturn = () => safe(() => sessionStorage.removeItem(RETURN_KEY))

// Where the user parked Mira (per-viewer convenience).
export const readDockPos = () => safe(() => JSON.parse(localStorage.getItem(DOCK_POS_KEY) || 'null'))
export const saveDockPos = (pos) => safe(() => localStorage.setItem(DOCK_POS_KEY, JSON.stringify(pos)))
