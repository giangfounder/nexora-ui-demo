import PropTypes from 'prop-types'
import { useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, IconButton, InputAdornment, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material'
import { IconArrowLeft, IconEdit, IconSearch } from '@tabler/icons-react'

// project imports
import useSearchShortcut from '@/hooks/useSearchShortcut'
import { getOS } from '@/utils/genericHelper'
import { useLanguage } from '@/store/context/LanguageContext'
import dashboardMenu from '@/menu-items/dashboard'

const os = getOS()
const isMac = os === 'macos'
const isDesktop = isMac || os === 'windows' || os === 'linux'
const shortcutKey = isMac ? '⌘F' : 'Ctrl+F'

// The page's own menu entry (longest URL prefix wins) → its icon and the menu group it lives in.
const findMenuEntry = (pathname) => {
    let best = null
    const walk = (node, group) => {
        ;(node.children || []).forEach((c) => {
            if (c.type === 'group') walk(c, c)
            else if (c.url && (pathname === c.url || pathname.startsWith(`${c.url}/`))) {
                if (!best || c.url.length > best.item.url.length) best = { item: c, group }
            }
        })
    }
    walk(dashboardMenu, null)
    return best
}

const initialsOf = (s = '') =>
    String(s)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()

// Shared page header for every menu page: one card with the page icon, menu group, title and actions.
// 2026 text-discipline rule: titles stand alone — `description` is kept for backward compat but never rendered.
const ViewHeader = ({
    children,
    filters = null,
    onSearchChange,
    search,
    searchPlaceholder = 'Search',
    title,
    // eslint-disable-next-line no-unused-vars
    description: _unusedDescription,
    isBackButton,
    onBack,
    isEditButton,
    onEdit,
    icon: IconProp,
    count
}) => {
    const theme = useTheme()
    const searchInputRef = useRef()
    useSearchShortcut(searchInputRef)
    const { t } = useLanguage()
    const { pathname } = useLocation()
    const entry = useMemo(() => findMenuEntry(pathname), [pathname])
    const PageIcon = IconProp || entry?.item.icon
    const dark = theme.palette.mode === 'dark'
    const primary = theme.palette.primary.main
    const hairline = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)

    return (
        <Box
            component='header'
            sx={{
                width: '100%',
                mb: 3,
                px: { xs: 2, md: 3 },
                py: 2,
                bgcolor: 'background.paper',
                border: `1px solid ${hairline}`,
                borderRadius: '10px',
                boxShadow: theme.customShadows?.xs
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent='space-between'
                spacing={2}
            >
                {/* Title cluster (left) */}
                <Stack direction='row' alignItems='center' spacing={2} sx={{ minWidth: 0, flex: 1 }}>
                    {isBackButton && (
                        <Tooltip title={t('Back')}>
                            <IconButton
                                aria-label={t('Back')}
                                onClick={onBack}
                                sx={{
                                    flexShrink: 0,
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    border: `1px solid ${theme.palette.alpha?.borderStrong || hairline}`,
                                    color: 'text.primary',
                                    boxShadow: dark ? 'none' : '0 1px 2px rgba(16,24,40,0.05)'
                                }}
                            >
                                <IconArrowLeft size={18} stroke={1.75} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Box
                        aria-hidden
                        sx={{
                            flexShrink: 0,
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                            bgcolor: alpha(primary, dark ? 0.2 : 0.09),
                            border: `1px solid ${alpha(primary, 0.22)}`,
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}
                    >
                        {PageIcon ? <PageIcon size={24} stroke={1.75} /> : initialsOf(t(title))}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        {entry?.group?.title && (
                            <Typography
                                sx={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                    lineHeight: 1.4,
                                    mb: 0.25
                                }}
                            >
                                {t(entry.group.title)}
                            </Typography>
                        )}
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <Typography
                                component='h1'
                                sx={{
                                    fontSize: { xs: '1.375rem', md: '1.625rem' },
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    minWidth: 0,
                                    wordBreak: 'break-word'
                                }}
                            >
                                {t(title)}
                            </Typography>
                            {count !== undefined && count !== null && (
                                <Box
                                    component='span'
                                    sx={{
                                        flexShrink: 0,
                                        minWidth: 26,
                                        height: 24,
                                        px: 1,
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        fontVariantNumeric: 'tabular-nums',
                                        color: 'text.secondary',
                                        bgcolor: alpha(theme.palette.text.primary, dark ? 0.12 : 0.06)
                                    }}
                                >
                                    {count}
                                </Box>
                            )}
                            {isEditButton && (
                                <Tooltip title={t('Edit')}>
                                    <IconButton
                                        size='small'
                                        aria-label={t('Edit')}
                                        onClick={onEdit}
                                        sx={{ flexShrink: 0, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                    >
                                        <IconEdit size={18} stroke={1.75} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Box>
                </Stack>

                {/* Actions cluster (right) */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexShrink: 0,
                        flexWrap: { xs: 'wrap', md: 'nowrap' }
                    }}
                >
                    {search && (
                        <OutlinedInput
                            inputRef={searchInputRef}
                            size='small'
                            type='search'
                            inputProps={{ 'aria-label': t(searchPlaceholder) }}
                            placeholder={t(searchPlaceholder)}
                            onChange={onSearchChange}
                            startAdornment={
                                <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                                    <IconSearch size={16} />
                                </InputAdornment>
                            }
                            endAdornment={
                                isDesktop ? (
                                    <InputAdornment position='end'>
                                        <Box
                                            component='kbd'
                                            sx={{
                                                fontSize: '0.6875rem',
                                                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                                                color: 'text.secondary',
                                                border: `1px solid ${hairline}`,
                                                borderRadius: '6px',
                                                px: 0.5,
                                                py: 0.25,
                                                lineHeight: 1
                                            }}
                                        >
                                            {shortcutKey}
                                        </Box>
                                    </InputAdornment>
                                ) : null
                            }
                            sx={{
                                width: { xs: '100%', sm: 300 },
                                height: 40,
                                display: { xs: 'none', sm: 'flex' },
                                borderRadius: '10px',
                                bgcolor: 'background.paper',
                                boxShadow: dark ? 'none' : '0 1px 2px rgba(16,24,40,0.05)'
                            }}
                        />
                    )}
                    {filters}
                    {children}
                </Box>
            </Stack>
        </Box>
    )
}

ViewHeader.propTypes = {
    children: PropTypes.node,
    filters: PropTypes.node,
    onSearchChange: PropTypes.func,
    search: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    isBackButton: PropTypes.bool,
    onBack: PropTypes.func,
    isEditButton: PropTypes.bool,
    onEdit: PropTypes.func,
    icon: PropTypes.elementType,
    count: PropTypes.node
}

export default ViewHeader
