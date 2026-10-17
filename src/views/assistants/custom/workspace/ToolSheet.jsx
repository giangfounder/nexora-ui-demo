import PropTypes from 'prop-types'
import { useMemo, useRef, useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    Drawer,
    FormControlLabel,
    Grid,
    IconButton,
    ListSubheader,
    Menu,
    MenuItem,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
    IconArrowLeft,
    IconArrowRight,
    IconBraces,
    IconChevronRight,
    IconPlus,
    IconSend,
    IconTrashFilled,
    IconWorld,
    IconX
} from '@tabler/icons-react'

import { useSheetShell, FormField } from '@/hooks/useDialogShell'
import {
    AttentionStrip,
    Eyebrow,
    LabelWithTip,
    R_CONTROL,
    SettingRow,
    ToneTag,
    cardSx,
    closeButtonSx,
    eyebrowSx,
    fieldLabelSx,
    hairlineListSx,
    hostOf,
    listRowSx,
    monoSx,
    panelSx,
    quietButtonSx,
    rowDeleteSx
} from './primitives'
import { RESEARCH_SOURCES, SYSTEM_VARS, VAR_TYPES, newApi } from './catalog'
import { CUSTOMER_ATTRS, slugify } from './tokens'
import { apiInputs, apiOutputs, sampleResponse, sampleValue } from './planner'

const isUrl = (s) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s)

// Customers Bảng/Kanban toggle look (customers/index.jsx), with MUI's neutral selected state.
const toggleGroupSx = {
    height: 30,
    '& .MuiToggleButton-root': {
        px: 1.5,
        py: 0,
        textTransform: 'none',
        fontSize: '0.8125rem',
        fontWeight: 500,
        borderRadius: R_CONTROL
    }
}

// Section header for a list body: overline + bare count.
const ListHead = ({ label, count }) => (
    <Stack direction='row' alignItems='center' spacing={1}>
        <Eyebrow>{label}</Eyebrow>
        <Typography variant='caption' sx={{ color: 'text.disabled', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {count}
        </Typography>
    </Stack>
)
ListHead.propTypes = { label: PropTypes.node, count: PropTypes.number }

// SettingsDialog text add button.
const AddButton = ({ onClick }) => (
    <Button startIcon={<IconPlus size={16} strokeWidth={2.5} />} onClick={onClick} sx={{ alignSelf: 'flex-start', fontWeight: 500 }}>
        Thêm
    </Button>
)
AddButton.propTypes = { onClick: PropTypes.func }

// FormField-style label with a trailing action (the 'Chèn' menu).
const LabelRow = ({ label, required, children }) => (
    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 0.75 }}>
        <Typography component='label' sx={fieldLabelSx}>
            {label}
            {required && (
                <Box component='span' sx={{ ml: 0.5, color: 'error.main' }}>
                    *
                </Box>
            )}
        </Typography>
        {children}
    </Stack>
)
LabelRow.propTypes = { label: PropTypes.node, required: PropTypes.bool, children: PropTypes.node }

// ---------------- Deep Research ----------------
const DeepResearchBody = ({ value, onChange }) => {
    const theme = useTheme()
    const [draft, setDraft] = useState('')
    const [error, setError] = useState('')

    const addLinks = () => {
        const parts = draft.split(/\s+/).filter(Boolean)
        if (!parts.length) return
        const valid = parts.filter(isUrl)
        const existing = new Set(value.links.map((l) => l.url))
        const fresh = valid.filter((u) => !existing.has(u)).map((url, i) => ({ id: `l${Date.now()}${i}`, url, scope: 'page' }))
        const bad = parts.length - valid.length
        setError(bad > 0 ? `${bad} link không hợp lệ đã bị bỏ qua` : '')
        if (fresh.length) onChange({ ...value, links: [...value.links, ...fresh] })
        setDraft(bad > 0 ? parts.filter((p) => !isUrl(p)).join('\n') : '')
    }

    const patchLink = (id, patch) => onChange({ ...value, links: value.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) })
    const removeLink = (id) => onChange({ ...value, links: value.links.filter((l) => l.id !== id) })

    return (
        <>
            <Stack spacing={1.5}>
                <FormField label='Nguồn URL'>
                    <Stack direction='row' spacing={1} alignItems='flex-start'>
                        <TextField
                            fullWidth
                            size='small'
                            multiline
                            maxRows={4}
                            value={draft}
                            error={!!error}
                            helperText={error || undefined}
                            onChange={(e) => {
                                setDraft(e.target.value)
                                setError('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    addLinks()
                                }
                            }}
                            placeholder='https://… (mỗi dòng một link)'
                            InputProps={{ sx: monoSx }}
                        />
                        <Button
                            variant='contained'
                            onClick={addLinks}
                            disabled={!draft.trim()}
                            startIcon={<IconPlus size={15} stroke={1.75} />}
                            sx={{ flexShrink: 0 }}
                        >
                            Thêm
                        </Button>
                    </Stack>
                </FormField>

                {value.links.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        Chưa có URL nào — agent sẽ chỉ dùng các nguồn mở rộng bên dưới.
                    </Typography>
                ) : (
                    <Box sx={panelSx(theme)}>
                        {value.links.map((l) => {
                            const host = hostOf(l.url)
                            return (
                                <Stack key={l.id} direction='row' alignItems='center' spacing={1.5} sx={{ px: 2, py: 1.5 }}>
                                    <Avatar
                                        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            bgcolor: alpha(theme.palette.text.primary, 0.06),
                                            color: 'text.secondary'
                                        }}
                                    >
                                        <IconWorld size={12} stroke={1.75} />
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            {host}
                                        </Typography>
                                        <Typography
                                            variant='caption'
                                            noWrap
                                            component='div'
                                            sx={{ ...monoSx, fontSize: '0.75rem', color: 'text.secondary' }}
                                        >
                                            {l.url}
                                        </Typography>
                                    </Box>
                                    <ToggleButtonGroup
                                        size='small'
                                        exclusive
                                        value={l.scope}
                                        onChange={(_, v) => v && patchLink(l.id, { scope: v })}
                                        sx={{ ...toggleGroupSx, flexShrink: 0 }}
                                    >
                                        <ToggleButton value='page'>Trang</ToggleButton>
                                        <ToggleButton value='domain'>Tên miền</ToggleButton>
                                    </ToggleButtonGroup>
                                    <Tooltip title='Gỡ'>
                                        <IconButton
                                            size='small'
                                            aria-label={`Gỡ ${host}`}
                                            onClick={() => removeLink(l.id)}
                                            sx={rowDeleteSx(theme)}
                                        >
                                            <IconTrashFilled size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )
                        })}
                    </Box>
                )}
            </Stack>

            <FormField label='Nguồn mở rộng'>
                <ToggleButtonGroup
                    size='small'
                    value={value.sources}
                    onChange={(_, v) => onChange({ ...value, sources: v })}
                    aria-label='Nguồn mở rộng'
                    sx={{ ...toggleGroupSx, alignSelf: 'flex-start' }}
                >
                    {RESEARCH_SOURCES.map((s) => (
                        <ToggleButton key={s.id} value={s.id}>
                            {s.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </FormField>

            <Box sx={hairlineListSx(theme)}>
                <SettingRow label='Độ sâu' labelId='dr-depth' value={`${value.depth} lớp`}>
                    <Slider
                        size='small'
                        value={value.depth}
                        onChange={(_, v) => onChange({ ...value, depth: v })}
                        min={1}
                        max={5}
                        step={1}
                        marks
                        aria-labelledby='dr-depth'
                        sx={{ mx: 1 }}
                    />
                </SettingRow>
                <SettingRow label='Số kết quả tối đa' labelId='dr-max' align='end'>
                    <TextField
                        size='small'
                        type='number'
                        value={value.maxResults}
                        onChange={(e) => onChange({ ...value, maxResults: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                        inputProps={{ min: 1, max: 50, 'aria-labelledby': 'dr-max' }}
                        sx={{ width: 96 }}
                    />
                </SettingRow>
            </Box>
        </>
    )
}
DeepResearchBody.propTypes = { value: PropTypes.object, onChange: PropTypes.func }

// ---------------- API caller (list → detail) ----------------

// Same anatomy as the TokenEditor InsertMenu: one quiet 'Chèn' button, overline group headers, one-line items.
const VarInsertMenu = ({ collectNames, otherOutputs, onPick }) => {
    const theme = useTheme()
    const [anchor, setAnchor] = useState(null)
    const open = Boolean(anchor)
    const groups = [
        { id: 'collect', label: 'Hỏi khách', items: collectNames.map((v) => ({ name: v })) },
        { id: 'api', label: 'Từ API khác', items: otherOutputs.map((o) => ({ name: o.v, hint: `từ ${o.from}` })) },
        { id: 'customer', label: 'Hồ sơ khách', items: CUSTOMER_ATTRS.map((a) => ({ name: a.key, hint: a.label })) },
        { id: 'system', label: 'Hệ thống', items: SYSTEM_VARS.map((v) => ({ name: v })) }
    ].filter((g) => g.items.length > 0)

    return (
        <>
            <Tooltip title='Chèn biến vào ô đang chọn'>
                <Button
                    size='small'
                    aria-haspopup='menu'
                    aria-expanded={open ? 'true' : undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => setAnchor(e.currentTarget)}
                    startIcon={<IconBraces size={14} stroke={1.75} />}
                    sx={{ ...quietButtonSx(theme), mr: -1 }}
                >
                    Chèn
                </Button>
            </Tooltip>
            <Menu
                anchorEl={anchor}
                open={open}
                onClose={() => setAnchor(null)}
                disableAutoFocusItem
                disableRestoreFocus
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { maxHeight: 360, minWidth: 280 } }}
            >
                {groups.flatMap((g) => [
                    <ListSubheader key={`h-${g.id}`} disableSticky sx={{ ...eyebrowSx, lineHeight: '32px', px: 2, bgcolor: 'transparent' }}>
                        {g.label}
                    </ListSubheader>,
                    ...g.items.map((it) => (
                        <MenuItem
                            key={`${g.id}-${it.name}`}
                            dense
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onPick(it.name)
                                setAnchor(null)
                            }}
                            sx={{ gap: 2 }}
                        >
                            <Box component='span' sx={{ ...monoSx, color: 'text.primary', flexShrink: 0 }}>
                                {'{{' + it.name + '}}'}
                            </Box>
                            {it.hint && (
                                <Typography variant='caption' color='text.secondary' noWrap sx={{ ml: 'auto', minWidth: 0 }}>
                                    {it.hint}
                                </Typography>
                            )}
                        </MenuItem>
                    ))
                ])}
            </Menu>
        </>
    )
}
VarInsertMenu.propTypes = { collectNames: PropTypes.array, otherOutputs: PropTypes.array, onPick: PropTypes.func }

const ApiDetail = ({ api, onChange, onBack, onDelete, toolState }) => {
    const theme = useTheme()
    const focusRef = useRef({ field: 'body', el: null })
    const [preview, setPreview] = useState(null)
    const [sending, setSending] = useState(false)

    const collectNames = toolState.collectInfo.variables.map((v) => v.name)
    const otherOutputs = toolState.apiCaller.apis
        .filter((a) => a.id !== api.id)
        .flatMap((a) => apiOutputs(a).map((v) => ({ v, from: a.name })))
        .filter((o, i, arr) => !collectNames.includes(o.v) && arr.findIndex((x) => x.v === o.v) === i)
    const inputs = apiInputs(api)

    const jsonState = useMemo(() => {
        if (!api.body.trim()) return 'empty'
        try {
            JSON.parse(api.body.replace(/\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/g, '0'))
            return 'ok'
        } catch {
            return 'error'
        }
    }, [api.body])

    const set = (patch) => onChange({ ...api, ...patch })
    const track = (field) => (e) => {
        focusRef.current = { field, el: e.target }
    }
    const insertVar = (name) => {
        const token = `{{${name}}}`
        const { field, el } = focusRef.current
        const cur =
            field === 'url' ? api.url : field === 'body' ? api.body : api.headers.find((h) => `header:${h.id}` === field)?.value ?? ''
        const start = el?.selectionStart ?? cur.length
        const end = el?.selectionEnd ?? cur.length
        const next = cur.slice(0, start) + token + cur.slice(end)
        if (field === 'url') set({ url: next })
        else if (field === 'body') set({ body: next })
        else set({ headers: api.headers.map((h) => (`header:${h.id}` === field ? { ...h, value: next } : h)) })
        requestAnimationFrame(() => {
            if (!el) return
            el.focus()
            el.setSelectionRange(start + token.length, start + token.length)
        })
    }

    const sendTest = () => {
        setSending(true)
        const sample = Object.fromEntries([...collectNames, ...otherOutputs.map((o) => o.v)].map((v) => [v, sampleValue(v)]))
        sample.customer_phone = '0901234567'
        sample.order_code = 'NX-20481'
        sample.api_token = '••••'
        sample['customer.phone'] = '0912345678'
        sample['customer.email'] = 'minhquan@example.com'
        setTimeout(() => {
            setPreview({
                ms: 160 + Math.round(Math.random() * 160),
                request: `${api.method} ${api.url.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, k) => sample[k] ?? `<${k}>`)}`,
                body: JSON.stringify({ ok: true, ...sampleResponse(api) }, null, 2)
            })
            setSending(false)
        }, 600)
    }

    const varState = (v) => {
        if (SYSTEM_VARS.includes(v)) return { tone: undefined, label: 'hệ thống' }
        if (v.startsWith('customer.')) {
            const a = CUSTOMER_ATTRS.find((x) => x.key === v)
            return a ? { tone: 'teal', label: `hồ sơ khách · ${a.label}` } : { tone: 'rose', label: 'thuộc tính không tồn tại' }
        }
        if (collectNames.includes(v)) return { tone: 'amber', label: 'hỏi khách' }
        const o = otherOutputs.find((x) => x.v === v)
        if (o) return { tone: 'orange', label: `từ ${o.from}` }
        return { tone: 'rose', label: 'chưa định nghĩa' }
    }

    // Until a field has been focused, the 'Chèn' in a label row targets that row's own field.
    const pickInto = (fallback) => (name) => {
        if (!focusRef.current.el) focusRef.current = { field: fallback, el: null }
        insertVar(name)
    }

    return (
        <>
            <Stack direction='row' alignItems='center' spacing={1}>
                <Tooltip title='Tất cả API'>
                    <IconButton
                        aria-label='Tất cả API'
                        onClick={onBack}
                        sx={{ ml: -1, width: 32, height: 32, borderRadius: R_CONTROL, color: 'text.secondary' }}
                    >
                        <IconArrowLeft size={18} stroke={1.75} />
                    </IconButton>
                </Tooltip>
                <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
                    {api.name || 'API chưa đặt tên'}
                </Typography>
                <FormControlLabel
                    labelPlacement='start'
                    control={<Switch size='small' checked={api.enabled !== false} onChange={(e) => set({ enabled: e.target.checked })} />}
                    label='Bật'
                    sx={{ mr: 0, gap: 1, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem', color: 'text.secondary' } }}
                />
            </Stack>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <FormField label='Tên API' required>
                        <TextField size='small' value={api.name} onChange={(e) => set({ name: e.target.value })} />
                    </FormField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField label='Mã gọi trong kịch bản'>
                        <TextField
                            size='small'
                            value={api.key}
                            onChange={(e) => set({ key: slugify(e.target.value) || api.key })}
                            InputProps={{
                                sx: { ...monoSx, fontWeight: 600 },
                                startAdornment: <Box sx={{ color: 'text.disabled', mr: 0.5, ...monoSx }}>{'{{api.'}</Box>,
                                endAdornment: <Box sx={{ color: 'text.disabled', ml: 0.5, ...monoSx }}>{'}}'}</Box>
                            }}
                        />
                    </FormField>
                </Grid>
            </Grid>

            <FormField label='Khi nào agent gọi'>
                <TextField
                    size='small'
                    value={api.when}
                    onChange={(e) => set({ when: e.target.value })}
                    placeholder='Mô tả tình huống để agent tự quyết định gọi API này'
                />
            </FormField>

            <Box>
                <LabelRow label='Endpoint' required>
                    <VarInsertMenu collectNames={collectNames} otherOutputs={otherOutputs} onPick={pickInto('url')} />
                </LabelRow>
                <Stack direction='row' spacing={1}>
                    <Select
                        size='small'
                        value={api.method}
                        onChange={(e) => set({ method: e.target.value })}
                        sx={{ width: 112, fontWeight: 600 }}
                    >
                        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField
                        fullWidth
                        size='small'
                        value={api.url}
                        onFocus={track('url')}
                        onSelect={track('url')}
                        onChange={(e) => set({ url: e.target.value })}
                        InputProps={{ sx: monoSx }}
                    />
                </Stack>
            </Box>

            <FormField label='Headers'>
                <Stack spacing={1}>
                    {api.headers.map((h) => (
                        <Stack key={h.id} direction='row' spacing={1} alignItems='center'>
                            <TextField
                                size='small'
                                placeholder='Key'
                                value={h.key}
                                onChange={(e) =>
                                    set({ headers: api.headers.map((x) => (x.id === h.id ? { ...x, key: e.target.value } : x)) })
                                }
                                sx={{ flex: 2 }}
                                InputProps={{ sx: monoSx }}
                            />
                            <TextField
                                size='small'
                                placeholder='Value'
                                value={h.value}
                                onFocus={track(`header:${h.id}`)}
                                onSelect={track(`header:${h.id}`)}
                                onChange={(e) =>
                                    set({ headers: api.headers.map((x) => (x.id === h.id ? { ...x, value: e.target.value } : x)) })
                                }
                                sx={{ flex: 3 }}
                                InputProps={{ sx: monoSx }}
                            />
                            <Tooltip title='Gỡ'>
                                <IconButton
                                    size='small'
                                    aria-label='Gỡ header'
                                    onClick={() => set({ headers: api.headers.filter((x) => x.id !== h.id) })}
                                    sx={rowDeleteSx(theme)}
                                >
                                    <IconTrashFilled size={16} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ))}
                    <Box>
                        <Button
                            size='small'
                            startIcon={<IconPlus size={14} strokeWidth={2.5} />}
                            onClick={() => set({ headers: [...api.headers, { id: `h${Date.now()}`, key: '', value: '' }] })}
                            sx={{ fontWeight: 500 }}
                        >
                            Thêm
                        </Button>
                    </Box>
                </Stack>
            </FormField>

            {api.method !== 'GET' && (
                <Box>
                    <LabelRow label='Body'>
                        <VarInsertMenu collectNames={collectNames} otherOutputs={otherOutputs} onPick={pickInto('body')} />
                    </LabelRow>
                    <TextField
                        fullWidth
                        multiline
                        minRows={5}
                        value={api.body}
                        onFocus={track('body')}
                        onSelect={track('body')}
                        onChange={(e) => set({ body: e.target.value })}
                        InputProps={{ sx: monoSx }}
                    />
                    {jsonState !== 'empty' && (
                        <Typography
                            variant='caption'
                            sx={{
                                display: 'block',
                                textAlign: 'right',
                                mt: 0.5,
                                fontSize: '0.75rem',
                                color: jsonState === 'error' ? 'error.main' : 'text.secondary'
                            }}
                        >
                            {jsonState === 'ok' ? 'JSON hợp lệ' : 'JSON lỗi cú pháp'}
                        </Typography>
                    )}
                </Box>
            )}

            <FormField label={`Đầu vào · ${inputs.length}`}>
                {inputs.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        API không dùng biến nào.
                    </Typography>
                ) : (
                    <Box sx={hairlineListSx(theme)}>
                        {inputs.map((v) => {
                            const st = varState(v)
                            const bad = st.tone === 'rose'
                            return (
                                <Stack key={v} direction='row' alignItems='center' spacing={2} sx={{ py: 1 }}>
                                    <Typography
                                        component='span'
                                        noWrap
                                        sx={{ ...monoSx, flex: 1, minWidth: 0, color: bad ? 'error.main' : 'text.primary' }}
                                    >
                                        {'{{' + v + '}}'}
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        noWrap
                                        sx={{ fontSize: '0.75rem', color: bad ? 'error.main' : 'text.secondary' }}
                                    >
                                        {st.label}
                                    </Typography>
                                </Stack>
                            )
                        })}
                    </Box>
                )}
            </FormField>

            <FormField
                label={
                    <LabelWithTip
                        text={`Đầu ra · ${api.outputs.length}`}
                        tip='Lưu giá trị trong response vào biến để dùng ở câu trả lời hoặc API sau.'
                    />
                }
            >
                <Stack spacing={1}>
                    {api.outputs.map((o) => (
                        <Stack key={o.id} direction='row' spacing={1} alignItems='center'>
                            <TextField
                                size='small'
                                placeholder='data.status'
                                value={o.path}
                                onChange={(e) =>
                                    set({ outputs: api.outputs.map((x) => (x.id === o.id ? { ...x, path: e.target.value } : x)) })
                                }
                                sx={{ flex: 1 }}
                                InputProps={{ sx: monoSx }}
                            />
                            <Box component='span' sx={{ display: 'inline-flex', flexShrink: 0, color: 'text.disabled' }}>
                                <IconArrowRight size={16} stroke={1.75} />
                            </Box>
                            <TextField
                                size='small'
                                placeholder='ten_bien'
                                value={o.var}
                                onChange={(e) =>
                                    set({
                                        outputs: api.outputs.map((x) =>
                                            x.id === o.id ? { ...x, var: e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() } : x
                                        )
                                    })
                                }
                                sx={{ flex: 1 }}
                                InputProps={{
                                    sx: { ...monoSx, fontWeight: 600 },
                                    startAdornment: <Box sx={{ color: 'text.disabled', mr: 0.5, ...monoSx }}>{'{{'}</Box>,
                                    endAdornment: <Box sx={{ color: 'text.disabled', ml: 0.5, ...monoSx }}>{'}}'}</Box>
                                }}
                            />
                            <Tooltip title='Gỡ'>
                                <IconButton
                                    size='small'
                                    aria-label='Gỡ đầu ra'
                                    onClick={() => set({ outputs: api.outputs.filter((x) => x.id !== o.id) })}
                                    sx={rowDeleteSx(theme)}
                                >
                                    <IconTrashFilled size={16} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ))}
                    <Box>
                        <Button
                            size='small'
                            startIcon={<IconPlus size={14} strokeWidth={2.5} />}
                            onClick={() => set({ outputs: [...api.outputs, { id: `o${Date.now()}`, path: '', var: '' }] })}
                            sx={{ fontWeight: 500 }}
                        >
                            Thêm
                        </Button>
                    </Box>
                </Stack>
            </FormField>

            <Box>
                <Stack direction='row' spacing={1}>
                    <Button variant='outlined' onClick={sendTest} disabled={sending} startIcon={<IconSend size={16} stroke={1.75} />}>
                        {sending ? 'Đang gửi…' : 'Thử'}
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button color='error' startIcon={<IconTrashFilled size={16} />} onClick={onDelete}>
                        Xoá
                    </Button>
                </Stack>
                {preview && (
                    <Box sx={{ mt: 2, ...cardSx(theme), overflow: 'hidden' }}>
                        <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.alpha.divider}` }}
                        >
                            <ToneTag tone='emerald'>200</ToneTag>
                            <Typography
                                variant='caption'
                                noWrap
                                sx={{ flex: 1, minWidth: 0, ...monoSx, fontSize: '0.75rem', color: 'text.secondary' }}
                            >
                                {preview.request}
                            </Typography>
                            <Typography
                                variant='caption'
                                sx={{ flexShrink: 0, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                            >
                                {preview.ms} ms
                            </Typography>
                        </Stack>
                        <Box
                            component='pre'
                            sx={{
                                m: 0,
                                p: 2,
                                ...monoSx,
                                fontSize: '0.75rem',
                                bgcolor: alpha(theme.palette.text.primary, 0.03),
                                overflowX: 'auto'
                            }}
                        >
                            {preview.body}
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    )
}
ApiDetail.propTypes = {
    api: PropTypes.object,
    onChange: PropTypes.func,
    onBack: PropTypes.func,
    onDelete: PropTypes.func,
    toolState: PropTypes.object
}

const ApiListBody = ({ value, onChange, toolState }) => {
    const theme = useTheme()
    const [editingId, setEditingId] = useState(null)
    const apis = value.apis
    const editing = apis.find((a) => a.id === editingId)

    if (editing)
        return (
            <ApiDetail
                api={editing}
                toolState={toolState}
                onBack={() => setEditingId(null)}
                onChange={(next) => onChange({ ...value, apis: apis.map((a) => (a.id === next.id ? next : a)) })}
                onDelete={() => {
                    onChange({ ...value, apis: apis.filter((a) => a.id !== editing.id) })
                    setEditingId(null)
                }}
            />
        )

    const add = () => {
        const a = newApi(apis.length + 1)
        onChange({ ...value, apis: [...apis, a] })
        setEditingId(a.id)
    }

    return (
        <Stack spacing={1.5}>
            <ListHead label='API' count={apis.length} />
            {apis.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                    Chưa có API nào. Thêm API để agent lấy dữ liệu từ hệ thống của bạn.
                </Typography>
            ) : (
                <Box sx={panelSx(theme)}>
                    {apis.map((a) => {
                        const on = a.enabled !== false
                        return (
                            <Stack
                                key={a.id}
                                direction='row'
                                alignItems='center'
                                spacing={1.5}
                                role='button'
                                tabIndex={0}
                                onClick={() => setEditingId(a.id)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingId(a.id)}
                                sx={listRowSx(theme)}
                            >
                                <Box
                                    sx={{
                                        ...monoSx,
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        width: 48,
                                        flexShrink: 0,
                                        color: on ? 'text.secondary' : 'text.disabled'
                                    }}
                                >
                                    {a.method}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant='body2'
                                        noWrap
                                        sx={{ fontWeight: 600, color: on ? 'text.primary' : 'text.secondary' }}
                                    >
                                        {a.name}
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        noWrap
                                        component='div'
                                        sx={{ ...monoSx, fontSize: '0.75rem', color: 'text.secondary' }}
                                    >
                                        {a.url.replace(/^https?:\/\//, '')}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant='caption'
                                    sx={{
                                        color: 'text.secondary',
                                        fontVariantNumeric: 'tabular-nums',
                                        flexShrink: 0,
                                        display: { xs: 'none', sm: 'block' }
                                    }}
                                >
                                    {`${apiInputs(a).length} vào · ${apiOutputs(a).length} ra`}
                                </Typography>
                                <Switch
                                    size='small'
                                    checked={on}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                        onChange({
                                            ...value,
                                            apis: apis.map((x) => (x.id === a.id ? { ...x, enabled: e.target.checked } : x))
                                        })
                                    }
                                    inputProps={{ 'aria-label': `Bật ${a.name}` }}
                                />
                                <IconChevronRight size={16} stroke={1.75} style={{ flexShrink: 0, opacity: 0.5 }} />
                            </Stack>
                        )
                    })}
                </Box>
            )}
            <AddButton onClick={add} />
        </Stack>
    )
}
ApiListBody.propTypes = { value: PropTypes.object, onChange: PropTypes.func, toolState: PropTypes.object }

// ---------------- Collect info ----------------
const CollectInfoBody = ({ value, onChange, toolState }) => {
    const theme = useTheme()
    const vars = value.variables
    const apis = toolState.apiCaller.apis.filter((a) => a.enabled !== false)
    const usedBy = (name) => apis.filter((a) => apiInputs(a).includes(name)).map((a) => a.name)
    const filledBy = (name) => apis.find((a) => apiOutputs(a).includes(name))?.name
    const dupes = useMemo(() => {
        const seen = {}
        vars.forEach((v) => (seen[v.name] = (seen[v.name] || 0) + 1))
        return new Set(Object.keys(seen).filter((k) => seen[k] > 1))
    }, [vars])

    const patch = (id, p) => onChange({ ...value, variables: vars.map((v) => (v.id === id ? { ...v, ...p } : v)) })
    const add = () =>
        onChange({
            ...value,
            variables: [...vars, { id: `v${Date.now()}`, name: `bien_${vars.length + 1}`, type: 'text', required: false, description: '' }]
        })

    return (
        <Stack spacing={1.5}>
            <ListHead label='Biến' count={vars.length} />

            {vars.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                    Chưa có biến. Thêm biến để agent biết cần hỏi khách những gì.
                </Typography>
            ) : (
                <Box sx={panelSx(theme)}>
                    {vars.map((v, i) => {
                        const source = filledBy(v.name)
                        const usage = [
                            ...usedBy(v.name).map((n) => `Cần cho ${n}`),
                            source &&
                                (toolState.guards.skipKnown ? `Tự điền từ ${source} — không hỏi lại` : `Có từ ${source} — vẫn hỏi xác nhận`)
                        ]
                            .filter(Boolean)
                            .join(' · ')
                        return (
                            <Box key={v.id} sx={{ p: 2 }}>
                                <Stack direction='row' spacing={1} alignItems='flex-start'>
                                    <Chip
                                        size='small'
                                        label={i + 1}
                                        sx={{
                                            mt: '7px',
                                            flexShrink: 0,
                                            height: 22,
                                            minWidth: 22,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            bgcolor: alpha(theme.palette.text.primary, 0.06),
                                            color: 'text.primary',
                                            fontVariantNumeric: 'tabular-nums'
                                        }}
                                    />
                                    <TextField
                                        size='small'
                                        value={v.name}
                                        error={dupes.has(v.name)}
                                        helperText={dupes.has(v.name) ? 'Trùng tên biến' : undefined}
                                        onChange={(e) => patch(v.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() })}
                                        sx={{ flex: 1, minWidth: 0 }}
                                        InputProps={{
                                            sx: { ...monoSx, fontWeight: 600 },
                                            startAdornment: <Box sx={{ color: 'text.disabled', mr: 0.5, ...monoSx }}>{'{{'}</Box>,
                                            endAdornment: <Box sx={{ color: 'text.disabled', ml: 0.5, ...monoSx }}>{'}}'}</Box>
                                        }}
                                    />
                                    <Select
                                        size='small'
                                        value={v.type}
                                        onChange={(e) => patch(v.id, { type: e.target.value })}
                                        sx={{ width: 112 }}
                                    >
                                        {VAR_TYPES.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Box sx={{ height: 37, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size='small'
                                                    checked={!!v.required}
                                                    onChange={(e) => patch(v.id, { required: e.target.checked })}
                                                />
                                            }
                                            label='Bắt buộc'
                                            sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }}
                                        />
                                    </Box>
                                    <Box sx={{ height: 37, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <Tooltip title='Xoá biến'>
                                            <IconButton
                                                aria-label='Xoá biến'
                                                onClick={() => onChange({ ...value, variables: vars.filter((x) => x.id !== v.id) })}
                                                sx={rowDeleteSx(theme)}
                                            >
                                                <IconTrashFilled size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                                <Stack spacing={1} sx={{ mt: 1, pl: '30px' }}>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        multiline
                                        maxRows={3}
                                        value={v.description}
                                        onChange={(e) => patch(v.id, { description: e.target.value })}
                                        placeholder='Cách agent hỏi khách — vd: hỏi khéo, không ép nếu khách từ chối'
                                    />
                                    <Stack direction='row' alignItems='center' spacing={1}>
                                        <Typography variant='caption' color='text.secondary' sx={{ flexShrink: 0 }}>
                                            Lấy sẵn từ hồ sơ
                                        </Typography>
                                        <Select
                                            size='small'
                                            value={v.prefill || ''}
                                            displayEmpty
                                            onChange={(e) => patch(v.id, { prefill: e.target.value })}
                                            sx={{ flex: 1, '& .MuiSelect-select': { py: 0.75, fontSize: '0.8125rem' } }}
                                        >
                                            <MenuItem value=''>
                                                <em>Không — luôn hỏi khách</em>
                                            </MenuItem>
                                            {CUSTOMER_ATTRS.map((a) => (
                                                <MenuItem key={a.key} value={a.key} sx={{ fontSize: '0.8125rem' }}>
                                                    {a.label} · {`{{${a.key}}}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Stack>
                                    {usage && (
                                        <Typography variant='caption' component='div' sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                            {usage}
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )
                    })}
                </Box>
            )}

            <AddButton onClick={add} />
        </Stack>
    )
}
CollectInfoBody.propTypes = { value: PropTypes.object, onChange: PropTypes.func, toolState: PropTypes.object }

// ---------------- Simple tools ----------------
const SimpleBody = ({ id, value, onChange }) => {
    if (id === 'calculator' || id === 'webBrowser')
        return (
            <Typography variant='body2' color='text.secondary'>
                Công cụ này không cần cấu hình.
            </Typography>
        )
    if (id === 'serpAPI' || id === 'braveSearch')
        return (
            <>
                <FormField label='API key' required>
                    <TextField
                        size='small'
                        type='password'
                        value={value.apiKey}
                        onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
                        placeholder='••••••••'
                    />
                </FormField>
                <FormField label='Số kết quả'>
                    <TextField
                        size='small'
                        type='number'
                        value={value.maxResults}
                        onChange={(e) => onChange({ ...value, maxResults: Number(e.target.value) || 1 })}
                        sx={{ width: 160 }}
                    />
                </FormField>
            </>
        )
    if (id === 'customTool')
        return (
            <>
                <FormField label='Tên hàm' required>
                    <TextField
                        size='small'
                        value={value.name}
                        onChange={(e) => onChange({ ...value, name: e.target.value })}
                        InputProps={{ sx: monoSx }}
                    />
                </FormField>
                <FormField label='Khi nào agent gọi'>
                    <TextField
                        size='small'
                        value={value.description}
                        onChange={(e) => onChange({ ...value, description: e.target.value })}
                    />
                </FormField>
                <FormField label='Mã JavaScript'>
                    <TextField
                        multiline
                        minRows={8}
                        value={value.code}
                        onChange={(e) => onChange({ ...value, code: e.target.value })}
                        InputProps={{ sx: monoSx }}
                    />
                </FormField>
            </>
        )
    if (id === 'zapierNLA')
        return (
            <FormField label='Webhook URL' required>
                <TextField
                    size='small'
                    value={value.webhook}
                    onChange={(e) => onChange({ ...value, webhook: e.target.value })}
                    placeholder='https://hooks.zapier.com/…'
                    InputProps={{ sx: monoSx }}
                />
            </FormField>
        )
    return (
        <FormField label='Endpoint mặc định'>
            <TextField
                size='small'
                value={value.endpoint}
                onChange={(e) => onChange({ ...value, endpoint: e.target.value })}
                placeholder='https://… (để trống: mọi endpoint)'
                InputProps={{ sx: monoSx }}
            />
        </FormField>
    )
}
SimpleBody.propTypes = { id: PropTypes.string, value: PropTypes.object, onChange: PropTypes.func }

// ---------------- Sheet ----------------
const ToolSheet = ({ tool, toolState, setToolState, onClose }) => {
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: tool?.sheet || 'md' })
    if (!tool) return null
    const enabled = !!toolState.enabled[tool.id]
    const value = toolState[tool.id]
    const setValue = (v) => setToolState((s) => ({ ...s, [tool.id]: v }))
    const toggle = () => setToolState((s) => ({ ...s, enabled: { ...s.enabled, [tool.id]: !s.enabled[tool.id] } }))

    return (
        <Drawer {...drawerProps} open onClose={onClose}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography noWrap sx={{ minWidth: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                        {tool.label}
                    </Typography>
                    <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                        <Tooltip title={enabled ? 'Tắt công cụ' : 'Bật công cụ'}>
                            <Switch size='small' checked={enabled} onChange={toggle} inputProps={{ 'aria-label': 'Bật công cụ' }} />
                        </Tooltip>
                        <Tooltip title='Đóng'>
                            <IconButton onClick={onClose} aria-label='Đóng' size='small' sx={closeButtonSx(theme)}>
                                <IconX size={16} strokeWidth={2.5} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
                <Box {...contentProps}>
                    {!enabled && (
                        <AttentionStrip
                            weight={600}
                            action={
                                <Button size='small' onClick={toggle} sx={{ minHeight: 26, py: 0 }}>
                                    Bật
                                </Button>
                            }
                        >
                            Công cụ đang tắt
                        </AttentionStrip>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            opacity: enabled ? 1 : 0.55,
                            transition: 'opacity 200ms ease-out'
                        }}
                    >
                        {tool.id === 'deepResearch' && <DeepResearchBody value={value} onChange={setValue} />}
                        {tool.id === 'apiCaller' && <ApiListBody value={value} onChange={setValue} toolState={toolState} />}
                        {tool.id === 'collectInfo' && <CollectInfoBody value={value} onChange={setValue} toolState={toolState} />}
                        {!['deepResearch', 'apiCaller', 'collectInfo'].includes(tool.id) && (
                            <SimpleBody id={tool.id} value={value || {}} onChange={setValue} />
                        )}
                    </Box>
                </Box>
                <Box {...footerProps}>
                    <Button variant='contained' onClick={onClose}>
                        Xong
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

ToolSheet.propTypes = {
    tool: PropTypes.object,
    toolState: PropTypes.object.isRequired,
    setToolState: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
}

export default ToolSheet

export { ApiDetail, ApiListBody, CollectInfoBody, DeepResearchBody }
