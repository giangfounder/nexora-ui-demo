// ==============================|| CUSTOMERS - SHARED UI HELPERS ||============================== //
import { alpha, lighten } from '@mui/material/styles'

const AVATAR_COLOR_KEYS = ['primary', 'secondary', 'warning', 'success', 'error']

export const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()

export const getAvatarColorKey = (seed = '') => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return AVATAR_COLOR_KEYS[hash % AVATAR_COLOR_KEYS.length]
}

// Maps a stage's position within its pipeline to a Chip color, so a customer's
// progress reads at a glance: early stages are neutral, later ones look "won".
export const getStageChipColor = (stageIndex, stageCount) => {
    if (stageCount <= 1) return 'default'
    const progress = stageIndex / (stageCount - 1)
    if (progress >= 1) return 'success'
    if (progress >= 0.5) return 'warning'
    return 'default'
}

// Tinted chips / avatars: a soft wash of `color` with readable text in both themes.
// Light: low alpha wash + the shade's `dark` text. Dark: stronger wash + a lightened text colour.
export const tintBg = (theme, color, light = 0.12, dark = 0.22) => alpha(color, theme.palette.mode === 'dark' ? dark : light)
export const tintText = (theme, spec) => (theme.palette.mode === 'dark' ? lighten(spec.main, 0.35) : spec.dark)
