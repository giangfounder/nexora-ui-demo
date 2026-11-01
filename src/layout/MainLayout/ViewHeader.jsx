import PropTypes from 'prop-types'
import { useRef } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, IconButton, InputAdornment, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// project imports
import useSearchShortcut from '@/hooks/useSearchShortcut'
import { getOS } from '@/utils/genericHelper'
import { useLanguage } from '@/store/context/LanguageContext'

const os = getOS()
const isMac = os === 'macos'
const isDesktop = isMac || os === 'windows' || os === 'linux'
const shortcutKey = isMac ? '⌘F' : 'Ctrl+F'

// Shared page header for every menu page: one flat card with the title, count and actions.
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
    // eslint-disable-next-line no-unused-vars
    icon: _unusedIcon,
    count
}) => {
    const theme = useTheme()
    const searchInputRef = useRef()
    useSearchShortcut(searchInputRef)
    const { t } = useLanguage()
    const dark = theme.palette.mode === 'dark'
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
                borderRadius: '8px'
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
                                <AppIcon name='ArrowLeft' size={18} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <Typography
                                component='h1'
                                sx={{
                                    fontFamily: theme.typography.h1?.fontFamily,
                                    fontSize: { xs: '1.375rem', md: '1.625rem' },
                                    fontWeight: 600,
                                    letterSpacing: '0',
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
                                        <AppIcon name='PencilSimpleLine' size={18} />
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
                                    <AppIcon name='MagnifyingGlass' size={16} />
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
