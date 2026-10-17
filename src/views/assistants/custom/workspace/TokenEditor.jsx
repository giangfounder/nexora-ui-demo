import PropTypes from 'prop-types'
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
    Box,
    Button,
    IconButton,
    InputBase,
    ListSubheader,
    Menu,
    MenuItem,
    Paper,
    Popover,
    Popper,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import {
    R_CARD,
    R_CONTROL,
    cardSx,
    eyebrowSx,
    inputShadow,
    monoSx,
    quietButtonSx,
    stripVi,
    tokenKindMeta,
    tokenShortLabel,
    toneOf,
    toneText
} from './primitives'
import { GROUPS, TOKEN_RE, TOKEN_SPLIT, refsIn, toneOfKind } from './tokens'
import { apiOutputs } from './planner'

const LINE = 22.4 // 14px × 1.6
const PAD_Y = 12
const TOKEN_ONE = /^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/
const TOKEN_TEST = /\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/
// A chip always serialises as {{name}}; keep the model in that same compact form so offsets agree.
const canon = (s) => String(s || '').replace(TOKEN_RE, '{{$1}}')
const KINDS = ['customer', 'collect', 'api', 'output', 'kb', 'system', 'unknown']

// ---------------------------------------------------------------------------
// Chip look (shared by the editor CSS, read-only chips and menus)
// ---------------------------------------------------------------------------

const chipLook = (theme, kind, unknown) => {
    const isDark = theme.palette.mode === 'dark'
    if (unknown) {
        const s = toneOf(theme, 'rose')
        return { bg: alpha(s.main, isDark ? 0.22 : 0.12), fg: isDark ? s.light : s.dark, border: alpha(s.main, 0.5) }
    }
    const tone = toneOfKind(kind)
    if (!tone) {
        return {
            bg: alpha(theme.palette.text.primary, isDark ? 0.14 : 0.06),
            fg: theme.palette.text.primary,
            border: alpha(theme.palette.text.primary, isDark ? 0.24 : 0.16)
        }
    }
    const s = toneOf(theme, tone)
    return { bg: alpha(s.main, isDark ? 0.22 : 0.1), fg: toneText(theme, s), border: alpha(s.main, isDark ? 0.5 : 0.35) }
}

// Kept for callers (studio views) that still want the raw colour pair.
export const tokenColors = (theme, tone, unknown) => {
    const isDark = theme.palette.mode === 'dark'
    if (unknown) {
        const s = toneOf(theme, 'rose')
        return { bg: alpha(s.main, 0.18), fg: isDark ? s.light : s.dark }
    }
    if (!tone) return { bg: alpha(theme.palette.text.primary, 0.08), fg: theme.palette.text.secondary }
    const s = toneOf(theme, tone)
    return { bg: alpha(s.main, isDark ? 0.22 : 0.14), fg: isDark ? s.light : s.dark }
}

export const tokenSx = (theme, kind, unknown) => {
    const look = chipLook(theme, kind, unknown)
    return { bgcolor: look.bg, color: look.fg, boxShadow: `0 0 0 1px ${look.border}` }
}

const chipLabel = (name, item) => (item ? tokenShortLabel(name, item) : name)
const KindIcon = ({ kind, size = 13 }) => {
    const Icon = kind === 'unknown' ? iconComponent('Warning') : tokenKindMeta(kind).Icon
    return <Icon size={size} stroke={1.75} style={{ flexShrink: 0, display: 'block' }} />
}
KindIcon.propTypes = { kind: PropTypes.string, size: PropTypes.number }

// Read-only chip: natural width, icon + human label. Used in read-backs, menus and the palette.
export const TokenChip = ({ name, registry, size = 'md' }) => {
    const theme = useTheme()
    const item = registry?.byName.get(name)
    const unknown = Boolean(registry) && !item
    const look = chipLook(theme, item?.kind, unknown)
    const sm = size === 'sm'
    return (
        <Box
            component='span'
            title={item ? `${tokenKindMeta(item.kind).label} · {{${name}}}` : `{{${name}}}`}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                verticalAlign: 'middle',
                maxWidth: '100%',
                height: sm ? 20 : 22,
                px: sm ? '6px' : '7px',
                borderRadius: R_CONTROL,
                border: `1px solid ${look.border}`,
                bgcolor: look.bg,
                color: look.fg,
                fontSize: sm ? '0.75rem' : '0.8125rem',
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap'
            }}
        >
            <KindIcon kind={unknown ? 'unknown' : item?.kind || 'system'} size={sm ? 12 : 13} />
            <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                {chipLabel(name, item)}
            </Box>
        </Box>
    )
}
TokenChip.propTypes = { name: PropTypes.string.isRequired, registry: PropTypes.object, size: PropTypes.oneOf(['sm', 'md']) }

// Secondary line under a variable in menus / the palette: what the value actually is.
export const tokenDetail = (name, item) => {
    if (!item) return 'Biến không tồn tại'
    if (item.kind === 'collect') return item.ref?.description || 'Hỏi khách'
    if (item.kind === 'output') return item.label
    if (item.kind === 'kb') return item.attached === false ? 'Kho chưa gắn vào trợ lý' : `{{${name}}}`
    return `{{${name}}}`
}

// ---------------------------------------------------------------------------
// contenteditable plumbing — the DOM is managed imperatively, React never renders its children.
// Model: plain string with {{tokens}}. DOM: [text | chip span | …] + a trailing sentinel <br>.
// ---------------------------------------------------------------------------

const svgCache = new Map()
const kindSvg = (kind) => {
    if (!svgCache.has(kind)) svgCache.set(kind, renderToStaticMarkup(<KindIcon kind={kind} size={13} />))
    return svgCache.get(kind)
}

const makeChipEl = (name, item) => {
    const kind = item ? item.kind : 'unknown'
    const el = document.createElement('span')
    el.contentEditable = 'false'
    el.className = 'tk-chip'
    el.dataset.token = name
    el.dataset.kind = kind
    el.title = item ? `${tokenKindMeta(kind).label} · {{${name}}} — bấm (hoặc Alt+Enter) để xem` : `Không có biến {{${name}}}`
    const ic = document.createElement('span')
    ic.className = 'tk-ic'
    ic.innerHTML = kindSvg(kind)
    const lb = document.createElement('span')
    lb.className = 'tk-lb'
    lb.textContent = chipLabel(name, item)
    el.append(ic, lb)
    return el
}

const renderInto = (root, value, registry) => {
    const frag = document.createDocumentFragment()
    String(value || '')
        .split(TOKEN_SPLIT)
        .forEach((part) => {
            if (!part) return
            const m = part.match(TOKEN_ONE)
            frag.appendChild(m ? makeChipEl(m[1], registry.byName.get(m[1])) : document.createTextNode(part))
        })
    const br = document.createElement('br')
    br.dataset.sentinel = '1'
    frag.appendChild(br)
    root.replaceChildren(frag)
}

const serializeNode = (root) => {
    let out = ''
    const walk = (parent) => {
        parent.childNodes.forEach((n) => {
            if (n.nodeType === 3) out += n.nodeValue
            else if (n.nodeType === 1) {
                if (n.dataset?.token !== undefined) out += `{{${n.dataset.token}}}`
                else if (n.tagName === 'BR') {
                    if (!n.dataset?.sentinel) out += '\n'
                } else if (n.tagName === 'DIV' || n.tagName === 'P') {
                    if (out.length && !out.endsWith('\n')) out += '\n'
                    walk(n)
                } else walk(n)
            }
        })
    }
    walk(root)
    return out
}

// Logical (string) offset of a DOM position inside root.
const logicalOffset = (root, node, offset) => {
    const r = document.createRange()
    r.setStart(root, 0)
    try {
        r.setEnd(node, offset)
    } catch (e) {
        return null
    }
    const div = document.createElement('div')
    div.appendChild(r.cloneContents())
    return canon(serializeNode(div)).length
}

// Selection.addRange never scrolls; probe the caret with a marker so structural edits stay visible.
const revealCaret = (root) => {
    const sel = window.getSelection()
    if (!root || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    const mark = document.createElement('span')
    mark.textContent = '\u200b'
    range.insertNode(mark)
    const rootRect = root.getBoundingClientRect()
    const r = mark.getBoundingClientRect()
    if (r.bottom > rootRect.bottom - PAD_Y) root.scrollTop += r.bottom - rootRect.bottom + PAD_Y
    else if (r.top < rootRect.top + PAD_Y) root.scrollTop -= rootRect.top + PAD_Y - r.top
    const parent = mark.parentNode
    const idx = [...parent.childNodes].indexOf(mark)
    mark.remove()
    const after = document.createRange()
    after.setStart(parent, Math.min(idx, parent.childNodes.length))
    after.collapse(true)
    sel.removeAllRanges()
    sel.addRange(after)
}

// Put the caret at a logical offset (root must be flat — always true right after renderInto).
const placeCaret = (root, target) => {
    const sel = window.getSelection()
    const range = document.createRange()
    let acc = 0
    let placed = false
    const kids = root.childNodes
    for (let i = 0; i < kids.length && !placed; i++) {
        const n = kids[i]
        if (n.nodeType === 3) {
            const len = n.nodeValue.length
            if (target <= acc + len) {
                range.setStart(n, Math.max(0, target - acc))
                placed = true
            }
            acc += len
        } else if (n.dataset?.token !== undefined) {
            const len = n.dataset.token.length + 4
            if (target <= acc) {
                range.setStart(root, i)
                placed = true
            } else if (target < acc + len) {
                range.setStart(root, i + 1)
                placed = true
            }
            acc += len
        } else if (n.tagName === 'BR' && n.dataset?.sentinel) {
            range.setStart(root, i)
            placed = true
        }
    }
    if (!placed) range.setStart(root, Math.max(0, kids.length - 1))
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
}

// End of the region that differs between two strings — where the caret belongs after undo/redo.
const diffCaret = (from, to) => {
    let s = 0
    const max = Math.min(from.length, to.length)
    while (s < max && from[s] === to[s]) s++
    let ea = from.length
    let eb = to.length
    while (ea > s && eb > s && from[ea - 1] === to[eb - 1]) {
        ea--
        eb--
    }
    return eb
}

const isFlat = (root) => {
    const kids = [...root.childNodes]
    const last = kids[kids.length - 1]
    if (!last || last.nodeType !== 1 || !last.dataset?.sentinel) return false
    return kids.every((n) => n.nodeType === 3 || n.dataset?.token !== undefined || n === last)
}

const hasRawToken = (root) => [...root.childNodes].some((n) => n.nodeType === 3 && TOKEN_TEST.test(n.nodeValue))

const chipSig = (value, registry) =>
    refsIn(value)
        .map((n) => {
            const it = registry.byName.get(n)
            return `${n}:${it ? `${it.kind}/${chipLabel(n, it)}` : '?'}`
        })
        .join('|')

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

// Grouped variable menu (used by "Đổi" and by each kind button under the editor).
const InsertMenu = ({ anchor, open, groups, registry, usedCounts, onPick, onClose, title }) => {
    const theme = useTheme()
    return (
        <Menu
            anchorEl={anchor}
            open={open}
            onClose={onClose}
            disableAutoFocusItem
            PaperProps={{
                sx: { maxHeight: 440, minWidth: 320, maxWidth: 440, borderRadius: R_CARD, boxShadow: theme.customShadows?.md }
            }}
        >
            {title && (
                <ListSubheader disableSticky sx={{ ...eyebrowSx, lineHeight: '28px', px: 2, pt: 1, bgcolor: 'transparent' }}>
                    {title}
                </ListSubheader>
            )}
            {groups.flatMap((g) => {
                const items = registry.items.filter((it) => it.kind === g.id)
                if (!items.length) return []
                return [
                    groups.length > 1 ? (
                        <ListSubheader
                            key={`h-${g.id}`}
                            disableSticky
                            sx={{
                                ...eyebrowSx,
                                lineHeight: '30px',
                                px: 2,
                                bgcolor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <KindIcon kind={g.id} size={12} />
                            {g.label}
                        </ListSubheader>
                    ) : null,
                    ...items.map((it) => {
                        const used = usedCounts?.[it.name] || 0
                        return (
                            <MenuItem
                                key={it.name}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onPick(it.name)
                                    onClose()
                                }}
                                sx={{ gap: 1.5, py: 1, alignItems: 'center' }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <TokenChip name={it.name} registry={registry} />
                                    <Typography
                                        variant='caption'
                                        component='div'
                                        noWrap
                                        sx={{
                                            mt: 0.5,
                                            color: 'text.secondary',
                                            ...(tokenDetail(it.name, it).startsWith('{{') && monoSx),
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {tokenDetail(it.name, it)}
                                    </Typography>
                                </Box>
                                {used > 0 && (
                                    <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0 }}>
                                        đã dùng
                                    </Typography>
                                )}
                            </MenuItem>
                        )
                    })
                ].filter(Boolean)
            })}
        </Menu>
    )
}
InsertMenu.propTypes = {
    anchor: PropTypes.any,
    open: PropTypes.bool,
    groups: PropTypes.array,
    registry: PropTypes.object,
    usedCounts: PropTypes.object,
    onPick: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string
}

// Attribute details for a single token — the popover body when a chip is clicked.
const describeToken = (name, item) => {
    if (!item) return [{ label: 'Trạng thái', value: 'Biến không tồn tại — đổi sang biến khác hoặc xoá' }]
    const rows = []
    if (item.kind === 'customer') {
        rows.push({ label: 'Nguồn', value: 'Hồ sơ khách hàng (CRM)' })
        rows.push({ label: 'Trường', value: item.label || name.split('.').pop() })
    }
    if (item.kind === 'collect') {
        rows.push({ label: 'Nguồn', value: 'Agent hỏi khách trong hội thoại' })
        if (item.ref?.description) rows.push({ label: 'Cách hỏi', value: item.ref.description })
        if (item.ref?.type) rows.push({ label: 'Kiểu', value: item.ref.type })
        if (item.ref?.prefill) rows.push({ label: 'Lấy sẵn từ', value: `{{${item.ref.prefill}}}` })
        rows.push({ label: 'Bắt buộc', value: item.ref?.required ? 'Có' : 'Không' })
    }
    if (item.kind === 'api') {
        const api = item.ref || {}
        rows.push({ label: 'Nguồn', value: 'Gọi API' })
        if (api.method || api.url) rows.push({ label: 'Endpoint', value: `${api.method || 'GET'} ${api.url || ''}`.trim() })
        if (api.outputs?.length) rows.push({ label: 'Trả về', value: apiOutputs(api).join(', ') })
        if (api.when) rows.push({ label: 'Dùng khi', value: api.when })
    }
    if (item.kind === 'output') {
        rows.push({ label: 'Nguồn', value: `Kết quả của API ${item.ref?.name || item.ref?.key || ''}`.trim() })
        const out = item.ref?.outputs?.find((o) => o.var === name)
        if (out?.path) rows.push({ label: 'Đường dẫn', value: out.path })
    }
    if (item.kind === 'kb') {
        const s = item.ref || {}
        rows.push({ label: 'Nguồn', value: 'Kho tài liệu' })
        if (s.name) rows.push({ label: 'Tên kho', value: s.name })
        rows.push({ label: 'Trạng thái', value: item.attached === false ? 'Chưa gắn vào trợ lý' : 'Đã gắn' })
    }
    if (item.kind === 'system') rows.push({ label: 'Nguồn', value: 'Hệ thống tự điền' })
    return rows
}

const AttrsPopover = ({ anchor, open, name, item, onClose, onDelete, onPickReplace }) => {
    const theme = useTheme()
    const meta = tokenKindMeta(item?.kind)
    const look = chipLook(theme, item?.kind, !item)
    const rows = useMemo(() => describeToken(name, item), [name, item])
    return (
        <Popover
            open={open}
            anchorEl={anchor}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
                paper: {
                    sx: {
                        mt: 0.75,
                        width: 340,
                        maxWidth: '90vw',
                        borderRadius: R_CARD,
                        boxShadow: theme.customShadows?.md,
                        overflow: 'hidden'
                    }
                }
            }}
        >
            <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.alpha.border}` }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: R_CONTROL,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: look.bg,
                        color: look.fg,
                        border: `1px solid ${look.border}`
                    }}
                >
                    <KindIcon kind={item ? item.kind : 'unknown'} size={17} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                        {item ? chipLabel(name, item) : name}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {item ? meta.label : 'Không xác định'}
                    </Typography>
                </Box>
                <IconButton size='small' aria-label='Đóng' onClick={onClose} sx={{ color: 'text.secondary' }}>
                    <AppIcon name='X' size={16} />
                </IconButton>
            </Stack>
            <Box component='dl' sx={{ m: 0, px: 2, py: 1 }}>
                {[{ label: 'Mã biến', value: `{{${name}}}`, mono: true }, ...rows].map((r, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '92px minmax(0, 1fr)',
                            columnGap: 1.5,
                            py: 1,
                            borderTop: i ? `1px solid ${theme.palette.alpha.divider}` : 'none'
                        }}
                    >
                        <Typography component='dt' sx={{ fontSize: '0.75rem', color: 'text.secondary', pt: '1px' }}>
                            {r.label}
                        </Typography>
                        <Typography
                            component='dd'
                            sx={{
                                m: 0,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: 'text.primary',
                                wordBreak: 'break-word',
                                ...(r.mono && monoSx)
                            }}
                        >
                            {r.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Stack direction='row' spacing={1} sx={{ px: 2, py: 1.25, borderTop: `1px solid ${theme.palette.alpha.border}` }}>
                <Button size='small' variant='outlined' startIcon={<AppIcon name='ArrowsLeftRight' size={14} />} onClick={onPickReplace}>
                    Đổi
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button size='small' color='error' startIcon={<AppIcon name='Trash' size={14} />} onClick={onDelete}>
                    Xoá
                </Button>
            </Stack>
        </Popover>
    )
}
AttrsPopover.propTypes = {
    anchor: PropTypes.any,
    open: PropTypes.bool,
    name: PropTypes.string,
    item: PropTypes.object,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    onPickReplace: PropTypes.func
}

// ---------------------------------------------------------------------------
// Variable palette — a persistent, searchable list; click a row to insert at the caret.
// ---------------------------------------------------------------------------

export const usedCountsOf = (value) => {
    const out = {}
    refsIn(value || '').forEach((n) => {
        out[n] = (out[n] || 0) + 1
    })
    return out
}

export const VariablePalette = ({ registry, value, onPick, groups, title = 'Biến có thể chèn', maxHeight = 520, sx }) => {
    const theme = useTheme()
    const [q, setQ] = useState('')
    const used = useMemo(() => usedCountsOf(value), [value])
    const shown = GROUPS.filter((g) => (!groups || groups.includes(g.id)) && registry.items.some((it) => it.kind === g.id))
    const needle = stripVi(q.trim())
    return (
        <Box
            sx={{
                ...cardSx(theme),
                display: 'flex',
                flexDirection: 'column',
                maxHeight,
                overflow: 'hidden',
                ...sx
            }}
        >
            <Box sx={{ px: 1.5, pt: 1.5, pb: 1, borderBottom: `1px solid ${theme.palette.alpha.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, mb: 1 }}>{title}</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1,
                        height: 32,
                        borderRadius: R_CONTROL,
                        border: `1px solid ${theme.palette.alpha.borderStrong}`,
                        '&:focus-within': { borderColor: 'primary.main', boxShadow: theme.customShadows?.focusRing }
                    }}
                >
                    <AppIcon name='MagnifyingGlass' size={14} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                    <InputBase
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder='Tìm biến'
                        inputProps={{ 'aria-label': 'Tìm biến' }}
                        sx={{ flex: 1, fontSize: '0.8125rem' }}
                    />
                </Box>
            </Box>
            <Box sx={{ overflowY: 'auto', py: 0.5 }}>
                {shown.map((g) => {
                    const items = registry.items.filter(
                        (it) => it.kind === g.id && (!needle || stripVi(`${it.name} ${it.label}`).includes(needle))
                    )
                    if (!items.length) return null
                    return (
                        <Box key={g.id} sx={{ pb: 0.5 }}>
                            <Stack direction='row' alignItems='center' spacing={0.75} sx={{ ...eyebrowSx, px: 1.5, pt: 1, pb: 0.5 }}>
                                <KindIcon kind={g.id} size={12} />
                                <span>{g.label}</span>
                            </Stack>
                            {items.map((it) => {
                                const n = used[it.name] || 0
                                const detail = tokenDetail(it.name, it)
                                return (
                                    <Box
                                        key={it.name}
                                        component='button'
                                        type='button'
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => onPick(it.name)}
                                        title={`Chèn {{${it.name}}}`}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.75,
                                            border: 0,
                                            background: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            color: 'text.primary',
                                            transition: 'background-color 120ms ease-out',
                                            '&:hover': { bgcolor: theme.palette.alpha.hover },
                                            '&:hover .pl-add': { opacity: 1 },
                                            '&:focus-visible': { outline: 'none', boxShadow: `inset ${theme.customShadows?.focusRing}` }
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <TokenChip name={it.name} registry={registry} size='sm' />
                                            <Typography
                                                noWrap
                                                sx={{
                                                    mt: 0.25,
                                                    fontSize: '0.6875rem',
                                                    color: 'text.secondary',
                                                    ...(detail.startsWith('{{') && { fontFamily: monoSx.fontFamily })
                                                }}
                                            >
                                                {detail}
                                            </Typography>
                                        </Box>
                                        {n > 0 ? (
                                            <Tooltip title={`Đã dùng ${n} lần`}>
                                                <Box
                                                    component='span'
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 0.25,
                                                        color: 'success.main',
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    <AppIcon name='Check' size={12} />
                                                    {n > 1 ? n : null}
                                                </Box>
                                            </Tooltip>
                                        ) : (
                                            <Box
                                                component='span'
                                                className='pl-add'
                                                sx={{
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    opacity: 0,
                                                    transition: 'opacity 120ms'
                                                }}
                                            >
                                                Chèn
                                            </Box>
                                        )}
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}
VariablePalette.propTypes = {
    registry: PropTypes.object.isRequired,
    value: PropTypes.string,
    onPick: PropTypes.func.isRequired,
    groups: PropTypes.array,
    title: PropTypes.string,
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sx: PropTypes.object
}

// ---------------------------------------------------------------------------
// The editor
// ---------------------------------------------------------------------------

const TokenEditor = forwardRef(function TokenEditor(
    { value, onChange, registry, minRows = 3, maxRows = 14, fill = false, placeholder, autoFocus, palette = true, groups, ariaLabel },
    ref
) {
    const theme = useTheme()
    const rootRef = useRef(null)
    const rendered = useRef({ value: null, sig: null })
    const composing = useRef(false)
    const lastSel = useRef(null) // { start, end } logical
    const queryRange = useRef(null) // live Range of the '{{…' being typed (anchors the suggestions)
    const touched = useRef(false) // user has edited here — only then is an outside replace worth an undo step
    const listId = useId()
    const history = useRef({ past: [], future: [], lastPush: 0 })
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    const [query, setQuery] = useState(null) // { text, start, end (logical), rect }
    const [active, setActive] = useState(0)
    const [kindMenu, setKindMenu] = useState(null) // { anchor, group }
    const [tokenOpen, setTokenOpen] = useState(null) // { anchor, name, item, start, end }
    const [replaceAnchor, setReplaceAnchor] = useState(null)

    const val = value || ''
    const isEmpty = val.length === 0
    const usedCounts = useMemo(() => usedCountsOf(val), [val])
    const shownGroups = GROUPS.filter((g) => (!groups || groups.includes(g.id)) && registry.items.some((it) => it.kind === g.id))

    // ---- sync model → DOM (external changes, registry label changes) ----
    useLayoutEffect(() => {
        const root = rootRef.current
        if (!root || composing.current) return
        const v = canon(val)
        const sig = chipSig(v, registry)
        const prevVal = rendered.current.value
        if (v === prevVal && sig === rendered.current.sig) return
        const focused = document.activeElement === root
        const caretAt = focused ? getCaret() : null
        if (prevVal != null && v !== prevVal && touched.current) {
            // Replaced from outside (AI 'Viết', a sibling full-screen editor…): keep it undoable, drop the old caret.
            pushHistory(prevVal, true)
            if (!focused) lastSel.current = null
        }
        renderInto(root, v, registry)
        rendered.current = { value: v, sig }
        if (focused && caretAt != null) placeCaret(root, Math.min(caretAt, v.length))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [val, registry])

    useEffect(() => {
        if (autoFocus && rootRef.current) {
            rootRef.current.focus()
            placeCaret(rootRef.current, val.length)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Remember the last caret position so palette / menu inserts land where the user was typing.
    useEffect(() => {
        const onSel = () => {
            const root = rootRef.current
            const sel = window.getSelection()
            if (!root || !sel.rangeCount) return
            const r = sel.getRangeAt(0)
            if (!root.contains(r.startContainer) || !root.contains(r.endContainer)) return
            const start = logicalOffset(root, r.startContainer, r.startOffset)
            const end = logicalOffset(root, r.endContainer, r.endOffset)
            if (start != null && end != null) lastSel.current = { start: Math.min(start, end), end: Math.max(start, end) }
        }
        document.addEventListener('selectionchange', onSel)
        return () => document.removeEventListener('selectionchange', onSel)
    }, [])

    // Block rich-text commands the browser would otherwise apply (bold, lists, drops).
    useEffect(() => {
        const root = rootRef.current
        if (!root) return undefined
        const onBefore = (e) => {
            if (e.inputType?.startsWith('format') || e.inputType === 'insertFromDrop') e.preventDefault()
            if ((e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') && !e.isComposing && !composing.current) {
                e.preventDefault()
                insertText('\n')
            }
        }
        root.addEventListener('beforeinput', onBefore)
        return () => root.removeEventListener('beforeinput', onBefore)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function getCaret() {
        const root = rootRef.current
        const sel = window.getSelection()
        if (!root || !sel.rangeCount) return null
        const r = sel.getRangeAt(0)
        if (!root.contains(r.endContainer)) return null
        return logicalOffset(root, r.endContainer, r.endOffset)
    }

    const selLogical = () => {
        const root = rootRef.current
        const sel = window.getSelection()
        if (root && sel.rangeCount) {
            const r = sel.getRangeAt(0)
            if (root.contains(r.startContainer) && root.contains(r.endContainer)) {
                const a = logicalOffset(root, r.startContainer, r.startOffset)
                const b = logicalOffset(root, r.endContainer, r.endOffset)
                if (a != null && b != null) return { start: Math.min(a, b), end: Math.max(a, b) }
            }
        }
        const cur = rendered.current.value || ''
        return lastSel.current || { start: cur.length, end: cur.length }
    }

    const pushHistory = (prev, force) => {
        const h = history.current
        const now = Date.now()
        h.future = []
        if (!force && h.past.length && now - h.lastPush < 700) {
            h.lastPush = now
            return
        }
        h.past.push(prev)
        if (h.past.length > 100) h.past.shift()
        h.lastPush = now
    }

    const commit = (raw, caretAt, { record = true } = {}) => {
        const root = rootRef.current
        touched.current = true
        const next = canon(raw)
        if (record) pushHistory(rendered.current.value || '', true)
        renderInto(root, next, registry)
        rendered.current = { value: next, sig: chipSig(next, registry) }
        onChangeRef.current(next)
        setQuery(null)
        if (caretAt != null) {
            const pos = Math.min(caretAt, next.length)
            const focusAt = () => {
                root.focus({ preventScroll: true })
                placeCaret(root, pos)
                revealCaret(root)
                lastSel.current = { start: pos, end: pos }
            }
            focusAt()
            // Menus / popovers trap focus and restore it on close — take it back once they have.
            setTimeout(() => {
                if (rootRef.current && document.activeElement !== rootRef.current) focusAt()
            }, 0)
        }
    }

    function insertText(text) {
        const cur = rendered.current.value || ''
        const { start, end } = selLogical()
        commit(cur.slice(0, start) + text + cur.slice(end), start + text.length)
    }

    // Insert a token at the caret with natural spacing on both sides.
    const insertToken = (name) => {
        const cur = rendered.current.value || ''
        const { start, end } = lastSel.current && document.activeElement !== rootRef.current ? lastSel.current : selLogical()
        const s = Math.min(start, cur.length)
        const e = Math.min(end, cur.length)
        const before = cur.slice(0, s)
        const after = cur.slice(e)
        const token = `{{${name}}}`
        const padL = before && !/[\s(["'“\-—/]$/.test(before) ? ' ' : ''
        // At the end of the text a trailing space lets the user keep typing without gluing words to the chip.
        const padR = !after || !/^[\s.,!?;:)\]"'”]/.test(after) ? ' ' : ''
        const head = before + padL + token + padR
        commit(head + after, head.length)
    }

    useImperativeHandle(ref, () => ({
        insert: insertToken,
        focus: () => {
            const root = rootRef.current
            if (!root) return
            root.focus()
            placeCaret(root, lastSel.current?.end ?? (rendered.current.value || '').length)
        }
    }))

    const detectQuery = () => {
        const root = rootRef.current
        const sel = window.getSelection()
        if (!root || !sel.rangeCount || !sel.isCollapsed) return setQuery(null)
        const r = sel.getRangeAt(0)
        const node = r.startContainer
        if (node.nodeType !== 3 || !root.contains(node)) return setQuery(null)
        const before = node.nodeValue.slice(0, r.startOffset)
        const m = before.match(/\{\{\s*([^{}\n]{0,40})$/)
        if (!m) return setQuery(null)
        const qr = document.createRange()
        qr.setStart(node, r.startOffset - m[0].length)
        qr.setEnd(node, r.startOffset)
        queryRange.current = qr
        const rect = qr.getBoundingClientRect()
        const end = logicalOffset(root, node, r.startOffset)
        setQuery({ text: m[1], start: end - m[0].length, end, rect })
        setActive(0)
    }

    const options = useMemo(() => {
        if (!query) return []
        const q = stripVi(query.text.trim())
        return registry.items
            .filter((it) => !groups || groups.includes(it.kind))
            .filter((it) => !q || stripVi(`${it.name} ${it.label}`).includes(q))
            .slice(0, 8)
    }, [query, registry, groups])

    const pickQuery = (name) => {
        const cur = rendered.current.value || ''
        let after = cur.slice(query.end)
        if (after.startsWith('}}')) after = after.slice(2)
        const token = `{{${name}}}`
        commit(cur.slice(0, query.start) + token + after, query.start + token.length)
    }

    const handleInput = () => {
        const root = rootRef.current
        if (!root) return
        const next = canon(serializeNode(root))
        const prev = rendered.current.value || ''
        touched.current = true
        if (next !== prev) pushHistory(prev, false)
        if (!composing.current && (!isFlat(root) || hasRawToken(root))) {
            const caretAt = getCaret()
            renderInto(root, next, registry)
            if (caretAt != null) placeCaret(root, caretAt)
        }
        rendered.current = { value: next, sig: chipSig(next, registry) }
        if (next !== prev) onChangeRef.current(next)
        detectQuery()
    }

    const undo = () => {
        const h = history.current
        if (!h.past.length) return
        const cur = rendered.current.value || ''
        const prev = h.past.pop()
        h.future.push(cur)
        h.lastPush = 0
        commit(prev, diffCaret(cur, prev), { record: false })
    }
    const redo = () => {
        const h = history.current
        if (!h.future.length) return
        const cur = rendered.current.value || ''
        const next = h.future.pop()
        h.past.push(cur)
        h.lastPush = 0
        commit(next, diffCaret(cur, next), { record: false })
    }

    // Keyboard route to the attribute popover: the chip right before the caret.
    const openChipBeforeCaret = () => {
        const root = rootRef.current
        const at = getCaret()
        if (!root || at == null) return false
        const cur = rendered.current.value || ''
        const matches = [...cur.matchAll(TOKEN_RE)]
        const k = matches.findIndex((m) => m.index + m[0].length === at || m.index + m[0].length === at - 1)
        if (k < 0) return false
        const chip = root.querySelectorAll('.tk-chip')[k]
        if (!chip) return false
        chip.dataset.active = 'true'
        setTokenOpen({
            anchor: chip,
            name: chip.dataset.token,
            item: registry.byName.get(chip.dataset.token),
            start: matches[k].index,
            end: matches[k].index + matches[k][0].length
        })
        return true
    }

    const onKeyDown = (e) => {
        // While a word is being composed (macOS Telex/VNI, CJK) every key belongs to the IME.
        // Safari also sends a keyCode-229 keydown right after compositionend.
        if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return
        if (e.altKey && e.key === 'Enter') {
            if (openChipBeforeCaret()) e.preventDefault()
            return
        }
        if (query && options.length) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => (a + 1) % options.length)
                return
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => (a - 1 + options.length) % options.length)
                return
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                pickQuery(options[active].name)
                return
            }
            if (e.key === 'Escape') {
                // keep the surrounding Drawer/Dialog open
                e.preventDefault()
                e.stopPropagation()
                setQuery(null)
                return
            }
        }
        const mod = e.ctrlKey || e.metaKey
        const k = e.key.toLowerCase()
        if (mod && k === 'z' && !e.shiftKey) {
            e.preventDefault()
            undo()
            return
        }
        if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) {
            e.preventDefault()
            redo()
            return
        }
        if (mod && ['b', 'i', 'u'].includes(k)) {
            e.preventDefault()
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            insertText('\n')
        }
    }

    const onPaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        if (text) insertText(text.replace(/\r\n?/g, '\n'))
    }

    const copySelection = (e) => {
        const sel = window.getSelection()
        if (!sel.rangeCount || sel.isCollapsed) return false
        const div = document.createElement('div')
        div.appendChild(sel.getRangeAt(0).cloneContents())
        e.clipboardData.setData('text/plain', serializeNode(div))
        e.preventDefault()
        return true
    }
    const onCut = (e) => {
        if (!copySelection(e)) return
        const cur = rendered.current.value || ''
        const { start, end } = selLogical()
        commit(cur.slice(0, start) + cur.slice(end), start)
    }

    const chipFromEvent = (e) => {
        const chip = e.target?.closest?.('.tk-chip')
        return chip && rootRef.current?.contains(chip) ? chip : null
    }

    const onMouseDown = (e) => {
        if (chipFromEvent(e)) e.preventDefault()
    }

    const onClick = (e) => {
        const chip = chipFromEvent(e)
        if (!chip) {
            detectQuery()
            return
        }
        e.preventDefault()
        const root = rootRef.current
        const k = [...root.querySelectorAll('.tk-chip')].indexOf(chip)
        const m = [...(rendered.current.value || '').matchAll(TOKEN_RE)][k]
        if (!m) return
        chip.dataset.active = 'true'
        setQuery(null)
        setTokenOpen({
            anchor: chip,
            name: chip.dataset.token,
            item: registry.byName.get(chip.dataset.token),
            start: m.index,
            end: m.index + m[0].length
        })
    }

    const closeToken = () => {
        if (tokenOpen?.anchor) tokenOpen.anchor.dataset.active = 'false'
        setTokenOpen(null)
    }

    const replaceToken = (name) => {
        if (!tokenOpen) return
        const cur = rendered.current.value || ''
        const token = `{{${name}}}`
        commit(cur.slice(0, tokenOpen.start) + token + cur.slice(tokenOpen.end), tokenOpen.start + token.length)
        setReplaceAnchor(null)
        closeToken()
    }

    const deleteToken = () => {
        if (!tokenOpen) return
        const cur = rendered.current.value || ''
        let { start, end } = tokenOpen
        if (cur[end] === ' ') end += 1
        else if (start > 0 && cur[start - 1] === ' ') start -= 1
        commit(cur.slice(0, start) + cur.slice(end), start)
        closeToken()
    }

    // Chip colours live in CSS keyed by data-kind, so theme switches need no DOM work.
    const chipCss = useMemo(() => {
        const css = {
            '& .tk-chip': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                verticalAlign: 'baseline',
                lineHeight: '18px',
                padding: '1px 7px 1px 6px',
                margin: '0 1px',
                borderRadius: R_CONTROL,
                border: '1px solid transparent',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'box-shadow 120ms ease-out',
                boxShadow: `0 1px 1px ${alpha(theme.palette.text.primary, 0.06)}`
            },
            '& .tk-chip:hover': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}` },
            '& .tk-chip[data-active="true"]': { boxShadow: `0 0 0 2px ${theme.palette.primary.main}` },
            '& .tk-ic': { display: 'inline-block', verticalAlign: '-2px', marginRight: '4px' },
            '& .tk-ic svg': { display: 'block' }
        }
        KINDS.forEach((k) => {
            const look = chipLook(theme, k === 'unknown' ? undefined : k, k === 'unknown')
            css[`& .tk-chip[data-kind="${k}"]`] = { backgroundColor: look.bg, color: look.fg, borderColor: look.border }
        })
        return css
    }, [theme])

    const textSx = {
        fontFamily: theme.typography.fontFamily,
        fontSize: '0.875rem',
        lineHeight: 1.6,
        padding: `${PAD_Y}px 14px`,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        tabSize: 4,
        boxSizing: 'border-box'
    }

    // Virtual anchor at the caret so the suggestions follow what is being typed.
    const acOpen = Boolean(query && options.length)
    const anchorEl = query
        ? {
              getBoundingClientRect: () => {
                  const r = queryRange.current
                  return r && rootRef.current?.contains(r.startContainer) ? r.getBoundingClientRect() : query.rect
              },
              contextElement: rootRef.current
          }
        : null

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, ...(fill && { flex: 1 }) }}>
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: R_CONTROL,
                    border: `1px solid ${theme.palette.alpha.borderStrong}`,
                    bgcolor: 'background.paper',
                    boxShadow: inputShadow(theme),
                    transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
                    '&:focus-within': { borderColor: 'primary.main', boxShadow: theme.customShadows?.focusRing },
                    ...(fill && { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' })
                }}
            >
                {isEmpty && placeholder && (
                    <Typography
                        aria-hidden
                        sx={{
                            ...textSx,
                            position: 'absolute',
                            inset: 0,
                            color: 'text.disabled',
                            pointerEvents: 'none',
                            overflow: 'hidden'
                        }}
                    >
                        {placeholder}
                    </Typography>
                )}
                <Box
                    ref={rootRef}
                    contentEditable
                    role='textbox'
                    aria-multiline='true'
                    aria-label={ariaLabel}
                    aria-placeholder={placeholder}
                    aria-autocomplete='list'
                    aria-haspopup='listbox'
                    aria-controls={acOpen ? listId : undefined}
                    aria-activedescendant={acOpen ? `${listId}-opt-${active}` : undefined}
                    aria-keyshortcuts='Alt+Enter'
                    spellCheck={false}
                    onInput={handleInput}
                    onKeyDown={onKeyDown}
                    onKeyUp={(e) => !['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key) && detectQuery()}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
                    onPaste={onPaste}
                    onCopy={copySelection}
                    onCut={onCut}
                    onDrop={(e) => e.preventDefault()}
                    onCompositionStart={() => (composing.current = true)}
                    onCompositionEnd={() => {
                        composing.current = false
                        handleInput()
                    }}
                    onBlur={() => setTimeout(() => setQuery(null), 120)}
                    sx={{
                        ...textSx,
                        ...chipCss,
                        position: 'relative',
                        outline: 'none',
                        overflowY: 'auto',
                        caretColor: theme.palette.text.primary,
                        color: 'text.primary',
                        ...(fill
                            ? { flex: 1, minHeight: 0 }
                            : { minHeight: minRows * LINE + PAD_Y * 2, maxHeight: maxRows * LINE + PAD_Y * 2 })
                    }}
                />
                <Popper open={acOpen} anchorEl={anchorEl} placement='bottom-start' sx={{ zIndex: 1500 }}>
                    <Paper
                        id={listId}
                        role='listbox'
                        aria-label='Gợi ý biến'
                        elevation={0}
                        sx={{
                            mt: 0.5,
                            width: 360,
                            maxWidth: '90vw',
                            py: 0.5,
                            borderRadius: R_CARD,
                            border: `1px solid ${theme.palette.alpha.border}`,
                            boxShadow: theme.customShadows?.md
                        }}
                    >
                        {options.map((o, i) => (
                            <Stack
                                key={o.name}
                                id={`${listId}-opt-${i}`}
                                role='option'
                                aria-selected={i === active}
                                direction='row'
                                spacing={1.5}
                                alignItems='center'
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    pickQuery(o.name)
                                }}
                                onMouseEnter={() => setActive(i)}
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    cursor: 'pointer',
                                    bgcolor: i === active ? theme.palette.alpha.hover : 'transparent'
                                }}
                            >
                                <TokenChip name={o.name} registry={registry} size='sm' />
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    noWrap
                                    sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}
                                >
                                    {tokenDetail(o.name, o)}
                                </Typography>
                            </Stack>
                        ))}
                    </Paper>
                </Popper>
            </Box>

            {palette && shownGroups.length > 0 && (
                <Stack direction='row' alignItems='center' sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mr: 0.25 }}>Chèn biến</Typography>
                    {shownGroups.map((g) => {
                        const n = registry.items.filter((it) => it.kind === g.id).reduce((acc, it) => acc + (usedCounts[it.name] || 0), 0)
                        const look = chipLook(theme, g.id)
                        return (
                            <Button
                                key={g.id}
                                size='small'
                                aria-haspopup='menu'
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => setKindMenu({ anchor: e.currentTarget, group: g })}
                                startIcon={
                                    <Box component='span' sx={{ color: look.fg, display: 'inline-flex' }}>
                                        <KindIcon kind={g.id} size={14} />
                                    </Box>
                                }
                                endIcon={<AppIcon name='CaretDown' size={12} />}
                                sx={{
                                    ...quietButtonSx(theme),
                                    height: 28,
                                    px: 1,
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    boxShadow: `inset 0 0 0 1px ${theme.palette.alpha.border}`,
                                    '& .MuiButton-startIcon': { mr: 0.5 },
                                    '& .MuiButton-endIcon': { ml: 0.25, color: 'text.disabled' }
                                }}
                            >
                                {g.label}
                                {n > 0 && (
                                    <Box component='span' sx={{ ml: 0.75, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                                        {n}
                                    </Box>
                                )}
                            </Button>
                        )
                    })}
                    <Typography sx={{ ml: 'auto', fontSize: '0.6875rem', color: 'text.disabled' }}>
                        hoặc gõ{' '}
                        <Box component='span' sx={monoSx}>
                            {'{{'}
                        </Box>
                    </Typography>
                </Stack>
            )}

            <InsertMenu
                anchor={kindMenu?.anchor}
                open={Boolean(kindMenu)}
                groups={kindMenu ? [kindMenu.group] : []}
                registry={registry}
                usedCounts={usedCounts}
                onPick={insertToken}
                onClose={() => setKindMenu(null)}
                title={kindMenu?.group.label}
            />
            <InsertMenu
                anchor={replaceAnchor}
                open={Boolean(replaceAnchor)}
                groups={shownGroups}
                registry={registry}
                usedCounts={usedCounts}
                onPick={replaceToken}
                onClose={() => setReplaceAnchor(null)}
                title='Đổi sang biến khác'
            />
            <AttrsPopover
                anchor={tokenOpen?.anchor}
                open={Boolean(tokenOpen)}
                name={tokenOpen?.name}
                item={tokenOpen?.item}
                onClose={closeToken}
                onPickReplace={(e) => setReplaceAnchor(e.currentTarget)}
                onDelete={deleteToken}
            />
        </Box>
    )
})

TokenEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    registry: PropTypes.object.isRequired,
    minRows: PropTypes.number,
    maxRows: PropTypes.number,
    fill: PropTypes.bool,
    placeholder: PropTypes.string,
    autoFocus: PropTypes.bool,
    palette: PropTypes.bool,
    groups: PropTypes.array,
    ariaLabel: PropTypes.string
}

export default TokenEditor
