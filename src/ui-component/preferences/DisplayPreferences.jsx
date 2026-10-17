import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, ButtonBase, Paper, Popover, Stack, Tooltip, Typography } from '@mui/material'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

import { SET_THEME_MODE } from '@/store/actions'
import { LANGUAGES } from '@/i18n'
import { useLanguage } from '@/store/context/LanguageContext'

// ==============================|| DISPLAY PREFERENCES ||============================== //
// One header control for appearance (light / dark / follow system) and language.

const MODE_OPTIONS = [
    { value: 'light', label: 'Sáng', Icon: IconSun },
    { value: 'dark', label: 'Tối', Icon: IconMoon },
    { value: 'system', label: 'Hệ thống', Icon: IconDeviceDesktop }
]

const Segmented = ({ value, options, onChange, label }) => {
    const theme = useTheme()
    return (
        <Box
            role='radiogroup'
            aria-label={label}
            sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${options.length}, 1fr)`,
                gap: 0.5,
                p: 0.5,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.06 : 0.04)
            }}
        >
            {options.map(({ value: v, label: l, Icon }) => {
                const selected = v === value
                return (
                    <ButtonBase
                        key={v}
                        role='radio'
                        aria-checked={selected}
                        onClick={() => onChange(v)}
                        sx={{
                            height: 34,
                            gap: 0.75,
                            borderRadius: '8px',
                            fontSize: 13,
                            fontWeight: selected ? 600 : 500,
                            color: selected ? 'text.primary' : 'text.secondary',
                            bgcolor: selected ? 'background.paper' : 'transparent',
                            boxShadow: selected ? `0 1px 2px ${alpha('#000', 0.12)}, 0 0 0 1px ${theme.palette.alpha?.border}` : 'none',
                            transition: 'background-color 120ms, color 120ms',
                            '&:hover': { color: 'text.primary' },
                            '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                        }}
                    >
                        {Icon && <Icon size={15} stroke={1.8} />}
                        {l}
                    </ButtonBase>
                )
            })}
        </Box>
    )
}

Segmented.propTypes = { value: PropTypes.string, options: PropTypes.array, onChange: PropTypes.func, label: PropTypes.string }

const DisplayPreferences = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { themeMode, isDarkMode } = useSelector((state) => state.customization)
    const { language, setLanguage, t } = useLanguage()
    const anchorRef = useRef(null)
    const [open, setOpen] = useState(false)

    const TriggerIcon = themeMode === 'system' ? IconDeviceDesktop : isDarkMode ? IconMoon : IconSun
    const short = LANGUAGES.find((l) => l.code === language)?.short

    return (
        <>
            <Tooltip title={t('Giao diện & ngôn ngữ')}>
                <ButtonBase
                    ref={anchorRef}
                    onClick={() => setOpen((v) => !v)}
                    aria-haspopup='dialog'
                    aria-expanded={open}
                    aria-label={t('Giao diện & ngôn ngữ')}
                    sx={{
                        height: 36,
                        px: 1.25,
                        gap: 0.75,
                        borderRadius: 1.5,
                        color: 'text.primary',
                        fontSize: 12.5,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        border: `1px solid ${theme.palette.alpha?.border}`,
                        bgcolor: open ? theme.palette.alpha?.hover : 'transparent',
                        transition: 'background-color 120ms, border-color 120ms',
                        '&:hover': { bgcolor: theme.palette.alpha?.hover, borderColor: theme.palette.alpha?.borderStrong },
                        '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                    }}
                >
                    <TriggerIcon size={17} stroke={1.75} />
                    {short}
                </ButtonBase>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorRef.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { mt: 1, borderRadius: '12px', overflow: 'visible' } } }}
            >
                <Paper
                    role='dialog'
                    aria-label={t('Giao diện & ngôn ngữ')}
                    sx={{ width: 300, p: 2, borderRadius: '12px', border: `1px solid ${theme.palette.alpha?.border}` }}
                >
                    <Stack spacing={2}>
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>{t('Giao diện')}</Typography>
                            <Segmented
                                label={t('Giao diện')}
                                value={themeMode}
                                options={MODE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
                                onChange={(mode) => dispatch({ type: SET_THEME_MODE, themeMode: mode })}
                            />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>{t('Ngôn ngữ')}</Typography>
                            <Segmented
                                label={t('Ngôn ngữ')}
                                value={language}
                                options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
                                onChange={setLanguage}
                            />
                        </Box>
                    </Stack>
                </Paper>
            </Popover>
        </>
    )
}

export default DisplayPreferences

// Compact language switch for pages outside the app shell (sign-in, legal pages).
export const LanguageInline = ({ sx }) => {
    const { language, setLanguage, t } = useLanguage()
    return (
        <Box component='span' role='radiogroup' aria-label={t('Ngôn ngữ')} sx={{ display: 'inline-flex', gap: 0.25, ...sx }}>
            {LANGUAGES.map((l) => {
                const selected = l.code === language
                return (
                    <ButtonBase
                        key={l.code}
                        role='radio'
                        aria-checked={selected}
                        aria-label={l.label}
                        onClick={() => setLanguage(l.code)}
                        sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '6px',
                            fontSize: 12.5,
                            fontWeight: selected ? 600 : 500,
                            color: selected ? 'text.primary' : 'text.disabled',
                            '&:hover': { color: 'text.primary' }
                        }}
                    >
                        {l.short}
                    </ButtonBase>
                )
            })}
        </Box>
    )
}

LanguageInline.propTypes = { sx: PropTypes.object }
