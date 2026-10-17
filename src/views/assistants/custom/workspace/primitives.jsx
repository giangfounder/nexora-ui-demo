import PropTypes from 'prop-types'
import { Avatar, Box, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { alpha, darken } from '@mui/material/styles'
import { IconApi, IconBookFilled, IconClipboardFilled, IconHash, IconInfoCircle, IconUserFilled, IconVariable } from '@tabler/icons-react'
import { getAvatarColorKey, getInitials, tintText } from '@/views/customers/utils'

// Radius contract: 6 control · 10 card · 12 shell (chat pane, bubbles, composer, tables) · 50% dots/avatars.
// Always pass these strings — a numeric borderRadius is multiplied by theme.shape.borderRadius.
export const R_CONTROL = '6px'
export const R_CARD = '10px'
export const R_SHELL = '12px'

export const ICON_STROKE = 1.75

export const toneOf = (theme, tone) => theme.palette.spectrum?.[tone] || theme.palette.primary
export const tintBg = (theme, color, light = 0.12, dark = 0.22) => alpha(color, theme.palette.mode === 'dark' ? dark : light)
// Text colour for a tone that stays AA-readable on paper and on its own tint; amber needs extra depth in light mode.
export const toneText = (theme, spec) => {
    if (theme.palette.mode === 'dark') return spec.light
    return spec === theme.palette.spectrum?.amber ? darken(spec.dark, 0.3) : spec.dark
}

// ---------------------------------------------------------------------------
// Elevation — every card / box on the assistant page sits on the same soft, layered shadow
// so surfaces read as physical objects instead of flat outlines.
// level 1: resting card · level 2: hover / raised · level 3: floating panel (chat, sheets)
// ---------------------------------------------------------------------------

export const cardShadow = (theme, level = 1) => {
    if (theme.palette.mode === 'dark') {
        const hi = 'inset 0 1px 0 rgba(255,255,255,0.05)'
        if (level >= 3) return `${hi}, 0 2px 4px rgba(0,0,0,0.45), 0 18px 40px -12px rgba(0,0,0,0.7)`
        if (level === 2) return `${hi}, 0 2px 4px rgba(0,0,0,0.4), 0 12px 28px -10px rgba(0,0,0,0.65)`
        return `${hi}, 0 1px 2px rgba(0,0,0,0.4), 0 6px 16px -6px rgba(0,0,0,0.55)`
    }
    if (level >= 3) return '0 1px 2px rgba(16,24,40,0.06), 0 4px 10px -2px rgba(16,24,40,0.07), 0 20px 40px -12px rgba(16,24,40,0.16)'
    if (level === 2) return '0 1px 2px rgba(16,24,40,0.06), 0 4px 8px -2px rgba(16,24,40,0.08), 0 14px 30px -10px rgba(16,24,40,0.16)'
    return '0 1px 2px rgba(16,24,40,0.05), 0 2px 6px -1px rgba(16,24,40,0.06), 0 10px 24px -10px rgba(16,24,40,0.12)'
}

// Inputs get a hairline drop so they look pressable, not drawn.
export const inputShadow = (theme) => (theme.palette.mode === 'dark' ? 'inset 0 1px 2px rgba(0,0,0,0.35)' : '0 1px 2px rgba(16,24,40,0.05)')

// Standard card surface: paper, hairline, 10px radius, level-1 shadow (+ optional hover lift).
export const cardSx = (theme, { level = 1, hover = false } = {}) => ({
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.alpha.border}`,
    borderRadius: R_CARD,
    boxShadow: cardShadow(theme, level),
    ...(hover && {
        transition: 'box-shadow 160ms ease-out, transform 160ms ease-out',
        '&:hover': { boxShadow: cardShadow(theme, level + 1) }
    })
})

// ---------------------------------------------------------------------------
// Token kind metadata (one place for icon + hue + Vietnamese label of each kind)
// ---------------------------------------------------------------------------

// Keep the Icon component plain outline/filled Tabler so TokenChip can size it per use.
export const TOKEN_KINDS = {
    customer: { label: 'Hồ sơ khách', short: 'Khách', tone: 'teal', Icon: IconUserFilled },
    collect: { label: 'Hỏi khách', short: 'Hỏi khách', tone: 'amber', Icon: IconVariable },
    api: { label: 'Gọi API', short: 'API', tone: 'orange', Icon: IconApi },
    output: { label: 'Trả về từ API', short: 'Đầu ra', tone: 'orange', Icon: IconHash },
    kb: { label: 'Kho tài liệu', short: 'Tài liệu', tone: 'emerald', Icon: IconBookFilled },
    system: { label: 'Hệ thống', short: 'Hệ thống', tone: undefined, Icon: IconClipboardFilled }
}

export const tokenKindMeta = (kind) => TOKEN_KINDS[kind] || TOKEN_KINDS.system

// Resolve a registry item (optional) into a short display label that a chip can show at any width.
export const tokenShortLabel = (name, item) => {
    if (!item) return name
    if (item.kind === 'api') return item.label || name.replace(/^api\./, '')
    if (item.kind === 'kb') return (item.label || name.replace(/^kb\./, '')).split(' · ')[0]
    if (item.kind === 'customer') return item.label || name.split('.').pop()
    if (item.kind === 'output') return name
    if (item.kind === 'collect') return name
    return name
}

// ---------------------------------------------------------------------------
// Typography vocabulary (CustomerDetail / omnichannel)
// ---------------------------------------------------------------------------

// Card / section title overline. Source text stays sentence case; CSS uppercases it.
export const eyebrowSx = {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'text.disabled',
    lineHeight: 1.4
}

export const Eyebrow = ({ children, component = 'span', sx, ...rest }) => (
    <Typography variant='caption' component={component} {...rest} sx={{ ...eyebrowSx, ...sx }}>
        {children}
    </Typography>
)

Eyebrow.propTypes = { children: PropTypes.node, component: PropTypes.elementType, sx: PropTypes.object }

// Field label — same as FormField and the former PlaybookSheet labelSx.
export const fieldLabelSx = { fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }

// Row meta: 0.75rem text.secondary joined with ' · ' (falsy items are dropped).
export const MetaText = ({ items, sx }) => (
    <Typography variant='caption' component='div' noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'text.secondary', ...sx }}>
        {items.filter(Boolean).join(' · ')}
    </Typography>
)

MetaText.propTypes = { items: PropTypes.array.isRequired, sx: PropTypes.object }

// ---------------------------------------------------------------------------
// Surfaces and lists
// ---------------------------------------------------------------------------

// Section card with optional ToneTile icon header. Pass `icon` + `tone` to get a tinted square
// badge; omit them to fall back to the quieter Eyebrow look used elsewhere.
export const SectionCard = ({ title, action, icon: Icon, tone = 'orange', hint, children, id }) => {
    const theme = useTheme()
    const spec = Icon ? toneOf(theme, tone) : null
    return (
        <Box id={id} component='section' sx={cardSx(theme)}>
            {(title || action) && (
                <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1.5}
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.alpha.divider}`
                    }}
                >
                    {Icon && (
                        <Box
                            aria-hidden
                            sx={{
                                flexShrink: 0,
                                width: 32,
                                height: 32,
                                borderRadius: R_CONTROL,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(spec.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                                color: toneText(theme, spec),
                                border: `1px solid ${alpha(spec.main, 0.35)}`
                            }}
                        >
                            <Icon size={18} stroke={1.75} />
                        </Box>
                    )}
                    {title && (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography component='h2' sx={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.3 }}>
                                {title}
                            </Typography>
                            {hint && (
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    sx={{ display: 'block', fontSize: '0.75rem', lineHeight: 1.4 }}
                                >
                                    {hint}
                                </Typography>
                            )}
                        </Box>
                    )}
                    {action && (
                        <Stack direction='row' alignItems='center' spacing={0.5} sx={{ ml: 'auto' }}>
                            {action}
                        </Stack>
                    )}
                </Stack>
            )}
            <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
    )
}

SectionCard.propTypes = {
    title: PropTypes.node,
    action: PropTypes.node,
    icon: PropTypes.elementType,
    tone: PropTypes.string,
    hint: PropTypes.string,
    children: PropTypes.node,
    id: PropTypes.string
}

// Sidebar nav item for the vertical workspace nav. Pass icon + label + count + selected.
export const NavItem = ({ icon: Icon, label, count, selected, onClick, tone = 'orange', endIcon, ariaControls, ariaLabel }) => {
    const theme = useTheme()
    const spec = toneOf(theme, tone)
    return (
        <Box
            component='button'
            type='button'
            role='tab'
            aria-selected={selected}
            aria-controls={ariaControls}
            aria-label={ariaLabel || label}
            onClick={onClick}
            sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                border: 0,
                borderRadius: R_CARD,
                background: selected ? alpha(spec.main, theme.palette.mode === 'dark' ? 0.18 : 0.09) : 'transparent',
                color: selected ? toneText(theme, spec) : 'text.primary',
                fontSize: '0.875rem',
                fontWeight: selected ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 140ms ease-out, color 140ms ease-out',
                '&:hover': {
                    backgroundColor: selected ? alpha(spec.main, theme.palette.mode === 'dark' ? 0.22 : 0.12) : theme.palette.alpha.hover
                },
                '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing },
                '&::before': selected
                    ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          bottom: 8,
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          bgcolor: spec.main
                      }
                    : {}
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: R_CONTROL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selected
                        ? alpha(spec.main, theme.palette.mode === 'dark' ? 0.28 : 0.14)
                        : alpha(theme.palette.text.primary, 0.05),
                    color: selected ? toneText(theme, spec) : 'text.secondary',
                    transition: 'background-color 140ms ease-out, color 140ms ease-out'
                }}
            >
                <Icon size={18} stroke={1.75} />
            </Box>
            <Box component='span' sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
            </Box>
            {count !== undefined && count !== null && (
                <Box
                    component='span'
                    sx={{
                        minWidth: 22,
                        height: 20,
                        px: 0.75,
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        bgcolor: selected ? alpha(spec.main, 0.22) : alpha(theme.palette.text.primary, 0.08),
                        color: selected ? toneText(theme, spec) : 'text.secondary'
                    }}
                >
                    {count}
                </Box>
            )}
            {endIcon}
        </Box>
    )
}

NavItem.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    tone: PropTypes.string,
    endIcon: PropTypes.node,
    ariaControls: PropTypes.string,
    ariaLabel: PropTypes.string
}

// Rows inside a card, split by divider hairlines.
export const hairlineListSx = (theme) => ({
    '& > * + *': { borderTop: `1px solid ${theme.palette.alpha.divider}` },
    '& > :first-child': { pt: 0 },
    '& > :last-child': { pb: 0 }
})

// Stand-alone bordered list; rows bring their own px 2 / py 1.5.
export const panelSx = (theme) => ({
    border: `1px solid ${theme.palette.alpha.border}`,
    borderRadius: R_CARD,
    bgcolor: 'background.paper',
    boxShadow: cardShadow(theme, 1),
    overflow: 'hidden',
    '& > * + *': { borderTop: `1px solid ${theme.palette.alpha.divider}` }
})

// Clickable row inside panelSx (neutral hover, focus ring). Add role/tabIndex/handlers at the call site.
export const listRowSx = (theme) => ({
    px: 2,
    py: 1.5,
    cursor: 'pointer',
    transition: 'background-color 120ms ease-out',
    '&:hover': { bgcolor: theme.palette.alpha.hover },
    '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing }
})

// Omnichannel segmented status track: <Stack direction='row' role='tablist' sx={segmentTrackSx(theme)}>.
export const segmentTrackSx = (theme) => ({
    p: 0.5,
    gap: 0.5,
    borderRadius: R_CARD,
    bgcolor: alpha(theme.palette.text.primary, 0.04)
})

// One segment: <ButtonBase role='tab' aria-selected={active} sx={segmentItemSx(theme, active)}>.
export const segmentItemSx = (theme, active) => ({
    height: 30,
    px: 1.5,
    gap: 0.5,
    borderRadius: R_CONTROL,
    typography: 'tabItem',
    fontSize: '0.8125rem',
    fontWeight: active ? 600 : 500,
    color: 'text.primary',
    bgcolor: active ? 'background.paper' : 'transparent',
    boxShadow: active ? theme.customShadows?.xs : 'none',
    transition: 'background-color 120ms ease-out, color 120ms ease-out',
    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
})

// Settings row: 0.875rem/500 label on the left, control in the middle, optional tabular value on the right.
// Wrap groups of rows in <Box sx={hairlineListSx(theme)}>.
export const SettingRow = ({ label, labelId, value, align = 'start', children }) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={{ xs: 1, sm: 2 }} sx={{ py: 1.5 }}>
        <Typography
            id={labelId}
            component='div'
            sx={{ width: { sm: 180 }, flexShrink: 0, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}
        >
            {label}
        </Typography>
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: align === 'end' ? 'flex-end' : 'flex-start'
            }}
        >
            {children}
        </Box>
        {value !== undefined && (
            <Typography
                sx={{
                    minWidth: 48,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    fontVariantNumeric: 'tabular-nums'
                }}
            >
                {value}
            </Typography>
        )}
    </Stack>
)

SettingRow.propTypes = {
    label: PropTypes.node,
    labelId: PropTypes.string,
    value: PropTypes.node,
    align: PropTypes.oneOf(['start', 'end']),
    children: PropTypes.node
}

// Replaces FormField hint captions: pass it as the FormField label.
export const LabelWithTip = ({ text, tip }) => (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {text}
        <Tooltip title={tip}>
            <Box component='span' tabIndex={0} aria-label={tip} sx={{ display: 'inline-flex', color: 'text.disabled', cursor: 'help' }}>
                <IconInfoCircle size={14} stroke={ICON_STROKE} />
            </Box>
        </Tooltip>
    </Box>
)

LabelWithTip.propTypes = { text: PropTypes.node, tip: PropTypes.string.isRequired }

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

// Card-header text actions (Viết, Tạo, Chèn): 26px tall, neutral.
export const quietButtonSx = (theme) => ({
    minHeight: 26,
    py: 0,
    px: 1,
    color: 'text.secondary',
    fontWeight: 500,
    '&:hover': { color: 'text.primary', bgcolor: theme.palette.alpha.hover }
})

// SettingsDialog close button; use with <IconX size={16} strokeWidth={2.5} />.
export const closeButtonSx = (theme) => ({
    width: 28,
    height: 28,
    borderRadius: R_CONTROL,
    color: 'text.secondary',
    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary' }
})

// SettingsDialog row delete; use with <IconTrashFilled size={16} />.
export const rowDeleteSx = (theme) => ({
    width: 32,
    height: 32,
    borderRadius: R_CONTROL,
    color: 'text.secondary',
    '&:hover': { bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.16 : 0.08), color: 'error.main' }
})

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

// Omnichannel tag: 6px radius, 18 (sm) / 20 (md) high, 11px/600, tone text on a soft wash. No dot, no icon.
// Only for warning/error/test states — positive states render nothing.
export const ToneTag = ({ tone = 'amber', size = 'sm', children, sx }) => {
    const theme = useTheme()
    const spec = toneOf(theme, tone)
    const dark = theme.palette.mode === 'dark'
    return (
        <Box
            component='span'
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
                height: size === 'sm' ? 18 : 20,
                px: 1,
                borderRadius: R_CONTROL,
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: toneText(theme, spec),
                bgcolor: alpha(spec.main, dark ? 0.2 : 0.12),
                ...sx
            }}
        >
            {children}
        </Box>
    )
}

ToneTag.propTypes = {
    tone: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md']),
    children: PropTypes.node,
    sx: PropTypes.object
}

// Omnichannel attention strip: soft warning/error wash, 6px dot, 13px text, optional trailing action.
export const AttentionStrip = ({ tone = 'amber', weight = 500, action, children, sx }) => {
    const theme = useTheme()
    const main = tone === 'rose' ? theme.palette.error.main : theme.palette.warning.main
    return (
        <Stack
            direction='row'
            alignItems='center'
            spacing={1}
            sx={{
                px: 1.5,
                py: 1,
                borderRadius: R_CONTROL,
                bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.14 : 0.06),
                ...sx
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: main, flexShrink: 0 }} />
            <Typography variant='body2' sx={{ flex: 1, minWidth: 0, fontSize: '0.8125rem', fontWeight: weight }}>
                {children}
            </Typography>
            {action}
        </Stack>
    )
}

AttentionStrip.propTypes = {
    tone: PropTypes.oneOf(['amber', 'rose']),
    weight: PropTypes.number,
    action: PropTypes.node,
    children: PropTypes.node,
    sx: PropTypes.object
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

// Same as the CustomerDetail header avatar and omnichannel CustomerAvatar (hashed tone, initials).
// Without a name it falls back to a neutral person glyph.
export const InitialsAvatar = ({ name, size = 40, fontSize }) => {
    const theme = useTheme()
    if (!name) {
        return (
            <Avatar sx={{ width: size, height: size, bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.secondary' }}>
                <IconUserFilled size={Math.round(size * 0.45)} />
            </Avatar>
        )
    }
    const spec = theme.palette[getAvatarColorKey(name)]
    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                fontSize: fontSize || size * 0.36,
                fontWeight: 600,
                bgcolor: alpha(spec.main, theme.palette.mode === 'dark' ? 0.24 : 0.15),
                color: tintText(theme, spec)
            }}
        >
            {getInitials(name)}
        </Avatar>
    )
}

InitialsAvatar.propTypes = {
    name: PropTypes.string,
    size: PropTypes.number,
    fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

// ---------------------------------------------------------------------------
// Legacy — kept for views/assistants/studio/* (no workspace file uses it any more).
// ---------------------------------------------------------------------------

// Same anatomy as DocumentStoreCard meta pills.
export const MetaPill = ({ icon: Icon, children, tone }) => {
    const theme = useTheme()
    const spec = tone ? toneOf(theme, tone) : null
    return (
        <Box
            component='span'
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                fontSize: '0.6875rem',
                lineHeight: 1.2,
                borderRadius: 999,
                border: `1px solid ${spec ? alpha(spec.main, 0.32) : theme.palette.alpha.border}`,
                color: spec ? toneText(theme, spec) : theme.palette.text.secondary,
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
        >
            {Icon && <Icon size={13} stroke={1.75} style={{ flexShrink: 0 }} />}
            {children}
        </Box>
    )
}

MetaPill.propTypes = { icon: PropTypes.elementType, children: PropTypes.node, tone: PropTypes.string }

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export const monoSx = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: '0.8125rem' }

export const stripVi = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

export const hostOf = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '')
    } catch {
        return url
    }
}
