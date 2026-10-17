import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

// material-ui
import { alpha, getLuminance, useTheme } from '@mui/material/styles'
import {
    Avatar,
    Badge,
    Box,
    Button,
    ButtonBase,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    InputBase,
    Menu,
    MenuItem,
    OutlinedInput,
    Stack,
    Tooltip,
    Typography
} from '@mui/material'
import {
    IconExternalLink,
    IconInbox,
    IconLayoutGrid,
    IconInfoCircle,
    IconMessageCircle,
    IconMoodSmile,
    IconPaperclip,
    IconSearch,
    IconSend,
    IconTemplate,
    IconX
} from '@tabler/icons-react'

// project imports
import { fullPageBottomOffset, fullPageHeight } from '@/store/constant'
import { useLanguage } from '@/store/context/LanguageContext'
import { getAvatarColorKey, getInitials } from '@/views/customers/utils'
import { mockCustomers } from '@/views/customers/mockCustomers'
import { mockEmployees } from '@/views/employees/mockEmployees'
import { CHANNELS, CHANNEL_ORDER, HANDOFF_TAGS, mockConversations } from './mockConversations'
import { getChannelIcon, sortByQueuePriority } from './utils'

// One short word per status — the colour carries the rest.
const STATUS_UI = {
    escalated: { label: 'Cần xử lý', tone: 'error' },
    ai_handling: { label: 'Tự động', tone: 'teal' },
    resolved: { label: 'Đã xong', tone: 'success' }
}
const STATUS_TABS = ['all', 'escalated', 'ai_handling', 'resolved']

const MACRO_TEMPLATES = [
    { id: 'm-greet', label: 'Chào mừng', text: 'Xin chào! Cảm ơn bạn đã liên hệ NEXORA. Mình có thể hỗ trợ gì cho bạn?' },
    {
        id: 'm-confirm-order',
        label: 'Xác nhận đơn',
        text: 'Cảm ơn bạn đã đặt hàng. Đơn của bạn đã được ghi nhận và sẽ được xử lý trong 24h tới.'
    },
    {
        id: 'm-shipping',
        label: 'Thông tin vận chuyển',
        text: 'Đơn hàng của bạn dự kiến giao trong 2-3 ngày làm việc. Mình sẽ gửi mã vận đơn ngay khi có.'
    },
    { id: 'm-thanks', label: 'Cảm ơn', text: 'Cảm ơn bạn rất nhiều! Nếu cần hỗ trợ thêm, cứ nhắn cho mình bất cứ lúc nào nhé.' },
    {
        id: 'm-apologize',
        label: 'Xin lỗi vì bất tiện',
        text: 'Xin lỗi bạn vì bất tiện. Mình sẽ kiểm tra ngay và phản hồi bạn trong ít phút.'
    }
]

const EMOJIS = ['👍', '❤️', '😊', '🙏', '🎉', '🔥', '✅', '💯', '🤝', '👀']

const STROKE = 1.75

// Readable foreground for a tinted chip: the darker shade on light surfaces, the lighter one on dark surfaces.
const toneFg = (theme, tone) => {
    if (theme.palette.mode !== 'dark') return tone.dark
    const { light, dark } = tone
    try {
        return getLuminance(light) >= getLuminance(dark) ? light : dark
    } catch {
        return light || dark
    }
}
const tintAlpha = (theme) => (theme.palette.mode === 'dark' ? 0.2 : 0.12)

// Mock relative times ('18 phút', '3 giờ') and day labels ('Yesterday', 'Mon') render in the active language.
const formatRelative = (value, t) => {
    if (!value || typeof value !== 'string') return value
    const m = value.match(/^(\d+)\s*(phút|giờ)$/)
    if (m) return m[2] === 'phút' ? t('{n} phút', { n: m[1] }) : t('{n} giờ', { n: m[1] })
    const d = value.match(/^(\d+) days ago$/)
    if (d) return t('{n} ngày trước', { n: d[1] })
    return t(value)
}

const formatDate = (iso, locale) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

// System notes in the thread are app copy, except for the teammate's name.
const formatSystemNote = (text, t) => {
    const m = typeof text === 'string' && text.match(/^Đã chuyển cho (.+)$/)
    if (m) return t('Đã chuyển cho {name}', { name: m[1] })
    return t(text)
}

const CustomerAvatar = ({ name, size }) => {
    const theme = useTheme()
    const ck = getAvatarColorKey(name)
    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                fontSize: size * 0.36,
                fontWeight: 600,
                bgcolor: alpha(theme.palette[ck].main, theme.palette.mode === 'dark' ? 0.24 : 0.15),
                color: toneFg(theme, theme.palette[ck])
            }}
        >
            {getInitials(name)}
        </Avatar>
    )
}

CustomerAvatar.propTypes = { name: PropTypes.string, size: PropTypes.number }

const Omnichannel = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const navigate = useNavigate()

    const [channelFilter, setChannelFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [conversations, setConversations] = useState(mockConversations)
    const [selectedId, setSelectedId] = useState(mockConversations[0]?.id)
    const [draft, setDraft] = useState('')
    const [contextOpen, setContextOpen] = useState(false)
    const [emojiAnchor, setEmojiAnchor] = useState(null)
    const [macroAnchor, setMacroAnchor] = useState(null)

    const isDark = theme.palette.mode === 'dark'
    const hairline = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const faint = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)
    const primary = theme.palette.primary.main
    const selectedBg = alpha(primary, isDark ? 0.16 : 0.08)
    const selectedHoverBg = alpha(primary, isDark ? 0.2 : 0.1)
    const logoShadow = isDark ? theme.customShadows?.xs || 'none' : `0 3px 8px -3px ${alpha(theme.palette.text.primary, 0.35)}`
    const warningFg = toneFg(theme, theme.palette.warning)
    const warningBg = alpha(theme.palette.warning.main, tintAlpha(theme))
    const toneOf = (tone) => theme.palette[tone] || theme.palette.spectrum?.[tone] || theme.palette.info

    // Counts follow the channel filter so tab numbers always match what the list shows.
    const counts = useMemo(() => {
        const byChannel = {}
        const byStatus = { all: 0, escalated: 0, ai_handling: 0, resolved: 0 }
        conversations.forEach((c) => {
            byChannel[c.channel] = (byChannel[c.channel] || 0) + 1
            if (channelFilter === 'all' || c.channel === channelFilter) {
                byStatus.all += 1
                byStatus[c.status] = (byStatus[c.status] || 0) + 1
            }
        })
        return { byChannel, byStatus }
    }, [conversations, channelFilter])

    const visibleConversations = useMemo(() => {
        const term = search.trim().toLowerCase()
        const list = conversations.filter((c) => {
            if (channelFilter !== 'all' && c.channel !== channelFilter) return false
            if (statusFilter !== 'all' && c.status !== statusFilter) return false
            if (term && !c.customerName.toLowerCase().includes(term)) return false
            return true
        })
        return sortByQueuePriority(list)
    }, [conversations, channelFilter, statusFilter, search])

    const selected = visibleConversations.find((c) => c.id === selectedId) || visibleConversations[0]
    const customer = selected ? mockCustomers.find((c) => c.id === selected.customerId) : null
    const employeeName = (id) => mockEmployees.find((e) => e.id === id)?.name || t('Hệ thống')

    const sendMessage = () => {
        if (!draft.trim() || !selected) return
        const now = new Date()
        const at = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selected.id
                    ? { ...c, messages: [...c.messages, { id: `m-${Date.now()}`, sender: 'agent', text: draft.trim(), at }] }
                    : c
            )
        )
        setDraft('')
    }
    const insertEmoji = (e) => {
        setDraft((prev) => prev + e)
        setEmojiAnchor(null)
    }
    const insertMacro = (m) => {
        setDraft(m.text)
        setMacroAnchor(null)
    }

    const statusLabel = (id) => (id === 'all' ? t('Tất cả') : t(STATUS_UI[id].label))

    // ---------- conversation list ----------
    const renderRow = (c) => {
        const isSelected = selected?.id === c.id
        const isUnread = c.unread > 0
        const needsHuman = c.status === 'escalated'
        const ChannelIcon = getChannelIcon(c.channel)
        const lastMsg = c.messages[c.messages.length - 1]
        return (
            <Box
                key={c.id}
                role='button'
                tabIndex={0}
                aria-current={isSelected || undefined}
                onClick={() => setSelectedId(c.id)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedId(c.id)
                    }
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mx: 1,
                    px: 1.25,
                    py: 1.25,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    bgcolor: isSelected ? selectedBg : 'transparent',
                    transition: 'background-color 120ms ease-out',
                    '&:hover': { bgcolor: isSelected ? selectedHoverBg : alpha(theme.palette.text.primary, 0.035) },
                    '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing }
                }}
            >
                <Badge
                    overlap='circular'
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                bgcolor: 'background.paper',
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: `0 0 0 1px ${hairline}`
                            }}
                        >
                            <ChannelIcon size={12} />
                        </Box>
                    }
                >
                    <CustomerAvatar name={c.customerName} size={40} />
                </Badge>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' alignItems='center' spacing={0.75}>
                        {needsHuman && (
                            <Tooltip title={t('Cần xử lý')}>
                                <Box
                                    component='span'
                                    aria-label={t('Cần xử lý')}
                                    sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }}
                                />
                            </Tooltip>
                        )}
                        <Typography
                            variant='body2'
                            noWrap
                            sx={{ flex: 1, minWidth: 0, fontWeight: isUnread ? 700 : 600, color: 'text.primary' }}
                        >
                            {c.customerName}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {formatRelative(c.waitingSince, t)}
                        </Typography>
                    </Stack>
                    <Stack direction='row' alignItems='center' spacing={1} sx={{ mt: 0.25 }}>
                        <Typography
                            variant='body2'
                            noWrap
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: '0.8125rem',
                                color: isUnread ? 'text.primary' : 'text.secondary',
                                fontWeight: isUnread ? 500 : 400
                            }}
                        >
                            {lastMsg?.text}
                        </Typography>
                        {c.tag && (
                            <Box
                                component='span'
                                sx={{
                                    px: 0.75,
                                    height: 18,
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    color: warningFg,
                                    bgcolor: warningBg,
                                    flexShrink: 0
                                }}
                            >
                                {t(c.tag)}
                            </Box>
                        )}
                        {isUnread && (
                            <Box
                                component='span'
                                aria-label={t('{n} chưa đọc', { n: c.unread })}
                                sx={{
                                    minWidth: 18,
                                    height: 18,
                                    px: 0.5,
                                    borderRadius: '9px',
                                    bgcolor: primary,
                                    color: theme.palette.primary.contrastText,
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontVariantNumeric: 'tabular-nums'
                                }}
                            >
                                {c.unread}
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>
        )
    }

    // ---------- thread ----------
    // Consecutive messages from the same sender form a run: avatar, "Tự động" label and time appear once per run.
    const renderMessages = () =>
        selected.messages.map((m, i) => {
            if (m.sender === 'system') {
                return (
                    <Stack key={m.id} direction='row' alignItems='center' spacing={1.5} sx={{ my: 1.5 }}>
                        <Divider sx={{ flex: 1, borderColor: faint }} />
                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                            {formatSystemNote(m.text, t)}
                        </Typography>
                        <Divider sx={{ flex: 1, borderColor: faint }} />
                    </Stack>
                )
            }
            const prev = selected.messages[i - 1]
            const next = selected.messages[i + 1]
            const firstOfRun = !prev || prev.sender !== m.sender
            const lastOfRun = !next || next.sender !== m.sender
            const isCustomer = m.sender === 'customer'
            const isAuto = m.sender === 'ai'
            const teal = theme.palette.spectrum?.teal || theme.palette.info
            return (
                <Stack key={m.id} alignItems={isCustomer ? 'flex-start' : 'flex-end'} sx={{ mt: firstOfRun ? 2 : 0.5 }}>
                    {isAuto && firstOfRun && (
                        <Typography variant='caption' sx={{ color: toneFg(theme, teal), fontWeight: 600, mb: 0.5, mr: 0.5 }}>
                            {t('Tự động')}
                        </Typography>
                    )}
                    <Stack direction='row' alignItems='flex-end' spacing={1} sx={{ maxWidth: '72%' }}>
                        {isCustomer && (
                            <Box sx={{ width: 28, flexShrink: 0 }}>
                                {lastOfRun && <CustomerAvatar name={selected.customerName} size={28} />}
                            </Box>
                        )}
                        <Box
                            sx={{
                                px: 1.75,
                                py: 1,
                                borderRadius: '16px',
                                ...(isCustomer
                                    ? { borderBottomLeftRadius: lastOfRun ? '6px' : '16px' }
                                    : { borderBottomRightRadius: lastOfRun ? '6px' : '16px' }),
                                bgcolor: isCustomer
                                    ? alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05)
                                    : isAuto
                                    ? alpha(teal.main, tintAlpha(theme))
                                    : primary,
                                color: isCustomer || isAuto ? 'text.primary' : theme.palette.primary.contrastText
                            }}
                        >
                            <Typography variant='body2' sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'inherit' }}>
                                {m.text}
                            </Typography>
                        </Box>
                    </Stack>
                    {lastOfRun && (
                        <Typography
                            variant='caption'
                            sx={{ color: 'text.disabled', mt: 0.5, px: isCustomer ? 4.5 : 0.5, fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatRelative(m.at, t)}
                        </Typography>
                    )}
                </Stack>
            )
        })

    return (
        <Box
            sx={{
                display: 'flex',
                height: fullPageHeight,
                mb: `${fullPageBottomOffset}px`,
                bgcolor: 'background.paper',
                border: `1px solid ${hairline}`,
                borderRadius: '12px',
                boxShadow: theme.customShadows?.xs,
                overflow: 'hidden'
            }}
        >
            {/* ===== Channel rail ===== */}
            <Stack
                component='nav'
                aria-label={t('Lọc theo kênh')}
                alignItems='center'
                spacing={0.75}
                sx={{
                    width: 72,
                    flexShrink: 0,
                    py: 1.75,
                    borderRight: `1px solid ${hairline}`,
                    bgcolor: alpha(theme.palette.text.primary, 0.02),
                    overflowY: 'auto',
                    scrollbarWidth: 'none'
                }}
            >
                {['all', ...CHANNEL_ORDER].map((id, i) => {
                    const active = channelFilter === id
                    const count = id === 'all' ? conversations.length : counts.byChannel[id] || 0
                    const label = id === 'all' ? t('Tất cả kênh') : t(CHANNELS[id].label)
                    const Icon = id === 'all' ? null : getChannelIcon(id)
                    return (
                        <Box key={id} sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            {i === 1 && <Box sx={{ position: 'absolute', top: -6, width: 28, height: '1px', bgcolor: hairline }} />}
                            <Tooltip title={`${label} · ${count}`} placement='right' arrow>
                                <ButtonBase
                                    aria-label={t('{label}, {n} hội thoại', { label, n: count })}
                                    aria-pressed={active}
                                    onClick={() => setChannelFilter(id)}
                                    sx={{
                                        position: 'relative',
                                        width: 44,
                                        height: 44,
                                        mt: i === 1 ? 1 : 0,
                                        borderRadius: '14px',
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: active ? 'background.paper' : 'transparent',
                                        boxShadow: active ? `0 0 0 2px ${primary}, 0 6px 14px -6px ${alpha(primary, 0.55)}` : 'none',
                                        transition: 'transform 160ms ease-out, box-shadow 160ms ease-out, background-color 160ms ease-out',
                                        '& .rail-logo': {
                                            opacity: active ? 1 : 0.82,
                                            transition: 'opacity 160ms ease-out, transform 160ms ease-out'
                                        },
                                        '&:hover': { bgcolor: active ? 'background.paper' : alpha(theme.palette.text.primary, 0.05) },
                                        '&:hover .rail-logo': { opacity: 1, transform: 'translateY(-1px) scale(1.06)' },
                                        '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                    }}
                                >
                                    <Box className='rail-logo' sx={{ display: 'grid', placeItems: 'center', lineHeight: 0 }}>
                                        {Icon ? (
                                            <Box
                                                sx={{
                                                    borderRadius: '9px',
                                                    boxShadow: logoShadow,
                                                    lineHeight: 0
                                                }}
                                            >
                                                <Icon size={32} />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '9px',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    color: active ? primary : 'text.primary',
                                                    bgcolor: active ? alpha(primary, 0.1) : alpha(theme.palette.text.primary, 0.06)
                                                }}
                                            >
                                                <IconLayoutGrid size={18} stroke={STROKE} />
                                            </Box>
                                        )}
                                    </Box>
                                    {count > 0 && (
                                        <Box
                                            component='span'
                                            aria-hidden
                                            sx={{
                                                position: 'absolute',
                                                top: -3,
                                                right: -5,
                                                minWidth: 18,
                                                height: 18,
                                                px: 0.5,
                                                borderRadius: '9px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.6875rem',
                                                fontWeight: 700,
                                                fontVariantNumeric: 'tabular-nums',
                                                color: active ? theme.palette.primary.contrastText : 'text.primary',
                                                bgcolor: active ? primary : 'background.paper',
                                                boxShadow: `0 0 0 1.5px ${theme.palette.background.paper}${
                                                    isDark ? '' : `, 0 1px 3px ${alpha(theme.palette.text.primary, 0.2)}`
                                                }`
                                            }}
                                        >
                                            {count}
                                        </Box>
                                    )}
                                </ButtonBase>
                            </Tooltip>
                            {active && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 10,
                                        bottom: 10,
                                        width: 3,
                                        borderRadius: '0 3px 3px 0',
                                        bgcolor: primary
                                    }}
                                />
                            )}
                        </Box>
                    )
                })}
            </Stack>

            {/* ===== Inbox ===== */}
            <Stack sx={{ width: 360, flexShrink: 0, borderRight: `1px solid ${hairline}` }}>
                <Stack spacing={1.5} sx={{ px: 2, pt: 2, pb: 1.25 }}>
                    <Stack direction='row' spacing={1}>
                        <OutlinedInput
                            size='small'
                            fullWidth
                            placeholder={t('Tìm khách hàng')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            inputProps={{ 'aria-label': t('Tìm khách hàng') }}
                            startAdornment={
                                <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                                    <IconSearch size={16} stroke={STROKE} />
                                </InputAdornment>
                            }
                            sx={{ height: 36, borderRadius: '10px', '& input': { fontSize: '0.875rem' } }}
                        />
                    </Stack>

                    {/* Status tabs */}
                    <Stack
                        direction='row'
                        role='tablist'
                        aria-label={t('Lọc theo trạng thái')}
                        sx={{ p: 0.5, gap: 0.5, borderRadius: '10px', bgcolor: alpha(theme.palette.text.primary, 0.04) }}
                    >
                        {STATUS_TABS.map((id) => {
                            const active = statusFilter === id
                            const count = counts.byStatus[id] || 0
                            return (
                                <ButtonBase
                                    key={id}
                                    role='tab'
                                    aria-selected={active}
                                    onClick={() => setStatusFilter(id)}
                                    sx={{
                                        flex: 1,
                                        height: 30,
                                        gap: 0.5,
                                        borderRadius: '7px',
                                        typography: 'tabItem',
                                        fontSize: '0.8125rem',
                                        fontWeight: active ? 600 : 500,
                                        color: 'text.primary',
                                        bgcolor: active ? 'background.paper' : 'transparent',
                                        boxShadow: active ? theme.customShadows?.xs : 'none',
                                        transition: 'background-color 120ms ease-out, color 120ms ease-out',
                                        '&:hover': { color: 'text.primary' },
                                        '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                    }}
                                >
                                    {statusLabel(id)}
                                    {count > 0 && id !== 'all' && (
                                        <Box
                                            component='span'
                                            sx={{
                                                fontVariantNumeric: 'tabular-nums',
                                                color: id === 'escalated' && active ? 'error.main' : 'text.disabled',
                                                fontWeight: 600
                                            }}
                                        >
                                            {count}
                                        </Box>
                                    )}
                                </ButtonBase>
                            )
                        })}
                    </Stack>
                </Stack>

                <Box sx={{ flex: 1, overflowY: 'auto', pb: 1 }}>
                    {visibleConversations.length === 0 ? (
                        <Stack alignItems='center' spacing={1} sx={{ py: 8, color: 'text.disabled' }}>
                            <IconInbox size={28} stroke={STROKE} />
                            <Typography variant='body2'>{t('Không có hội thoại nào')}</Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={0.25}>{visibleConversations.map(renderRow)}</Stack>
                    )}
                </Box>
            </Stack>

            {/* ===== Thread ===== */}
            {selected ? (
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' alignItems='center' spacing={1.5} sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${hairline}` }}>
                        <CustomerAvatar name={selected.customerName} size={40} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                                {selected.customerName}
                            </Typography>
                            <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.25 }}>
                                {(() => {
                                    const CH = getChannelIcon(selected.channel)
                                    return (
                                        <Tooltip title={t(CHANNELS[selected.channel].label)}>
                                            <Box sx={{ display: 'inline-flex' }} aria-label={t(CHANNELS[selected.channel].label)}>
                                                <CH size={14} />
                                            </Box>
                                        </Tooltip>
                                    )
                                })()}
                                {(() => {
                                    const ui = STATUS_UI[selected.status]
                                    const tone = toneOf(ui.tone)
                                    return (
                                        <Box
                                            component='span'
                                            sx={{
                                                px: 0.875,
                                                height: 20,
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                fontSize: '0.6875rem',
                                                fontWeight: 600,
                                                color: toneFg(theme, tone),
                                                bgcolor: alpha(tone.main, tintAlpha(theme))
                                            }}
                                        >
                                            {t(ui.label)}
                                        </Box>
                                    )
                                })()}
                            </Stack>
                        </Box>
                        <Tooltip title={t('Thông tin khách hàng')}>
                            <IconButton
                                onClick={() => setContextOpen(true)}
                                aria-label={t('Mở thông tin khách hàng')}
                                sx={{ width: 36, height: 36, borderRadius: '10px', color: 'text.secondary' }}
                            >
                                <IconInfoCircle size={20} stroke={STROKE} />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Why a teammate is needed — one line, only when it matters */}
                    {selected.status === 'escalated' && selected.handoffTag && HANDOFF_TAGS[selected.handoffTag] && (
                        <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            sx={{
                                px: 3,
                                py: 1,
                                bgcolor: alpha(theme.palette.error.main, isDark ? 0.14 : 0.06),
                                borderBottom: `1px solid ${faint}`
                            }}
                        >
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                            <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0 }}>
                                {t(HANDOFF_TAGS[selected.handoffTag].label)}
                            </Typography>
                            {selected.handoffNote && (
                                <Typography variant='body2' noWrap sx={{ color: 'text.secondary', fontSize: '0.8125rem', minWidth: 0 }}>
                                    {selected.handoffNote}
                                </Typography>
                            )}
                        </Stack>
                    )}

                    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 3, pt: 1 }}>{renderMessages()}</Box>

                    {/* Composer */}
                    <Box sx={{ px: 3, pb: 2.5, pt: 1 }}>
                        <Box
                            sx={{
                                border: `1px solid ${hairline}`,
                                borderRadius: '14px',
                                px: 1.75,
                                pt: 1.25,
                                pb: 0.75,
                                transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
                                '&:focus-within': { borderColor: alpha(primary, 0.5), boxShadow: theme.customShadows?.focusRing }
                            }}
                        >
                            <InputBase
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={6}
                                placeholder={t('Nhập tin nhắn…')}
                                inputProps={{ 'aria-label': t('Nhập tin nhắn') }}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}
                            />
                            <Stack direction='row' alignItems='center' spacing={0.25} sx={{ mt: 0.5 }}>
                                {[
                                    { label: 'Đính kèm', icon: IconPaperclip, onClick: undefined },
                                    { label: 'Emoji', icon: IconMoodSmile, onClick: (e) => setEmojiAnchor(e.currentTarget) },
                                    { label: 'Mẫu trả lời', icon: IconTemplate, onClick: (e) => setMacroAnchor(e.currentTarget) }
                                ].map(({ label, icon: Icon, onClick }) => (
                                    <Tooltip key={label} title={t(label)}>
                                        <IconButton
                                            size='small'
                                            aria-label={t(label)}
                                            onClick={onClick}
                                            sx={{ width: 32, height: 32, borderRadius: '8px', color: 'text.secondary' }}
                                        >
                                            <Icon size={18} stroke={STROKE} />
                                        </IconButton>
                                    </Tooltip>
                                ))}
                                <Box sx={{ flex: 1 }} />
                                <Tooltip title={t('Gửi · Enter')}>
                                    <span>
                                        <IconButton
                                            aria-label={t('Gửi')}
                                            onClick={sendMessage}
                                            disabled={!draft.trim()}
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '10px',
                                                bgcolor: primary,
                                                color: theme.palette.primary.contrastText,
                                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                                '&.Mui-disabled': {
                                                    bgcolor: alpha(theme.palette.text.primary, 0.06),
                                                    color: theme.palette.text.disabled
                                                }
                                            }}
                                        >
                                            <IconSend size={17} stroke={STROKE} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Box>

                        <Menu
                            anchorEl={emojiAnchor}
                            open={Boolean(emojiAnchor)}
                            onClose={() => setEmojiAnchor(null)}
                            PaperProps={{ sx: { p: 1, borderRadius: '12px' } }}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                                {EMOJIS.map((e) => (
                                    <IconButton
                                        key={e}
                                        onClick={() => insertEmoji(e)}
                                        aria-label={t('Chèn {emoji}', { emoji: e })}
                                        sx={{ width: 36, height: 36 }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{e}</span>
                                    </IconButton>
                                ))}
                            </Box>
                        </Menu>

                        <Menu
                            anchorEl={macroAnchor}
                            open={Boolean(macroAnchor)}
                            onClose={() => setMacroAnchor(null)}
                            PaperProps={{ sx: { minWidth: 300, borderRadius: '12px', maxHeight: 400 } }}
                        >
                            {MACRO_TEMPLATES.map((m) => (
                                <MenuItem
                                    key={m.id}
                                    onClick={() => insertMacro(m)}
                                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                                >
                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                        {t(m.label)}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary' noWrap sx={{ width: '100%' }}>
                                        {m.text}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Stack>
            ) : (
                <Stack alignItems='center' justifyContent='center' spacing={1} sx={{ flex: 1, color: 'text.disabled' }}>
                    <IconMessageCircle size={36} stroke={STROKE} />
                    <Typography variant='body2'>{t('Chọn một hội thoại')}</Typography>
                </Stack>
            )}

            {/* Customer panel */}
            <Drawer
                anchor='right'
                open={contextOpen}
                onClose={() => setContextOpen(false)}
                PaperProps={{ sx: { width: 340, bgcolor: 'background.paper' } }}
            >
                {selected && (
                    <Stack sx={{ height: '100%' }}>
                        <Stack direction='row' justifyContent='flex-end' sx={{ px: 1.5, pt: 1.5 }}>
                            <IconButton
                                size='small'
                                onClick={() => setContextOpen(false)}
                                aria-label={t('Đóng')}
                                sx={{ color: 'text.secondary' }}
                            >
                                <IconX size={18} stroke={STROKE} />
                            </IconButton>
                        </Stack>

                        <Stack alignItems='center' spacing={1} sx={{ px: 3, pb: 3 }}>
                            <CustomerAvatar name={selected.customerName} size={72} />
                            <Typography variant='h3' component='h2' sx={{ textAlign: 'center' }}>
                                {selected.customerName}
                            </Typography>
                            {customer?.tags?.length > 0 && (
                                <Stack direction='row' justifyContent='center' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                    {customer.tags.map((tag) => (
                                        <Box
                                            key={tag}
                                            component='span'
                                            sx={{
                                                px: 1,
                                                height: 22,
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: warningFg,
                                                bgcolor: warningBg
                                            }}
                                        >
                                            {t(tag)}
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Stack>

                        {customer && (
                            <Stack component='dl' spacing={2} sx={{ px: 3, py: 2.5, m: 0, borderTop: `1px solid ${faint}` }}>
                                {[
                                    ['Email', customer.email || '—'],
                                    ['Điện thoại', customer.phone || '—'],
                                    ['Liên hệ gần nhất', formatDate(customer.lastContactAt, locale)],
                                    ...(selected.assignedTo ? [['Phụ trách', employeeName(selected.assignedTo)]] : [])
                                ].map(([label, value]) => (
                                    <Box key={label}>
                                        <Typography component='dt' variant='caption' sx={{ color: 'text.secondary' }}>
                                            {t(label)}
                                        </Typography>
                                        <Typography component='dd' variant='body2' sx={{ m: 0, wordBreak: 'break-word' }}>
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {customer && (
                            <Box sx={{ px: 3, py: 2, mt: 'auto', borderTop: `1px solid ${faint}` }}>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    endIcon={<IconExternalLink size={16} stroke={STROKE} />}
                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                >
                                    {t('Mở hồ sơ khách hàng')}
                                </Button>
                            </Box>
                        )}
                    </Stack>
                )}
            </Drawer>
        </Box>
    )
}

export default Omnichannel
